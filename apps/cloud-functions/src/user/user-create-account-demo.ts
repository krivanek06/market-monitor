import { faker } from '@faker-js/faker';
import {
  getHistoricalPricesOnDateCF,
  getIsMarketOpenCF,
  getStockHistoricalPricesOnDateCF,
  getSymbolSummariesCF,
} from '@mm/api-external';
import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  OutstandingOrder,
  PortfolioTransaction,
  SYMBOL_NOT_FOUND_ERROR,
  SymbolSummary,
  USER_ALLOWED_DEMO_ACCOUNTS_PER_IP,
  USER_ALLOWED_DEMO_ACCOUNTS_TOTAL,
  UserAccountEnum,
  UserCreateDemoAccountInput,
  UserData,
  UserDataDemoData,
  UserPortfolioTransaction,
} from '@mm/api-types';
import {
  createTransaction,
  dateFormatDate,
  getCurrentDateDefaultFormat,
  getCurrentDateDetailsFormat,
  getPortfolioGrowth,
  getPortfolioGrowthAssets,
  getRandomNumber,
  getTransactionsStartDate,
  getYesterdaysDate,
  roundNDigits,
} from '@mm/shared/general-util';
import { format, subDays } from 'date-fns';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import {
  userCollectionDemoAccountRef,
  userDocumentPortfolioGrowthRef,
  userDocumentTransactionHistoryRef,
  userDocumentWatchListRef,
} from '../database';
import { isFirebaseEmulator } from '../utils';
import { userCreate } from './user-create-account';

export const userCreateAccountDemo = async (data: UserCreateDemoAccountInput): Promise<UserDataDemoData> => {
  // check how many demo accounts are created per IP
  const demoAccountsTotal = await userCollectionDemoAccountRef().get();
  const demoAccountsPerIp = demoAccountsTotal.docs.filter((d) => d.data().userPrivateInfo.publicIP === data.publicIP);

  console.log('demoAccounts', demoAccountsPerIp.length, 'from IP', data.publicIP);

  // throw error if too many demo accounts are created
  if (!isFirebaseEmulator() && demoAccountsPerIp.length > USER_ALLOWED_DEMO_ACCOUNTS_PER_IP) {
    throw new HttpsError('aborted', 'Too many demo accounts created from this IP');
  }

  // throw error if too many accounts
  if (!isFirebaseEmulator() && demoAccountsTotal.docs.length >= USER_ALLOWED_DEMO_ACCOUNTS_TOTAL) {
    throw new HttpsError('aborted', 'Too many demo accounts created for not, try later');
  }

  // create random password
  const randomPassword = faker.internet.password();

  const demoService = new CreateDemoAccountService();
  await demoService.initService(10, 20);

  // create demo accounts
  const newDemoUser = await demoService.createRandomUser({
    isDemo: true,
    password: randomPassword,
  });

  // create user document
  const newUser = await userCreate(newDemoUser, {
    isDemo: true,
    userAccountType: data.accountType,
    publicIP: data.publicIP,
  });

  console.log('Created demo user:', newUser.personal.displayName);

  // create watchList
  demoService.createWatchListWithRandomSymbols(newUser);

  console.log('Created watchList for user:', newUser.personal.displayName);

  // generate transactions in async
  demoService.generateTransactionsForRandomSymbols(newUser).then((transactions) => {
    console.log('Generated transactions, user:', newUser.personal.displayName);
    // create portfolio growth data
    demoService.generatePortfolioGrowthData(newUser, transactions);
    console.log('Generated portfolio growth, user:', newUser.personal.displayName);
  });

  return { userData: newUser, password: randomPassword };
};

export class CreateDemoAccountService {
  private symbolToTransact: SymbolSummary[] = [];
  private watchListSymbols: SymbolSummary[] = [];
  private symbolHistoricalPrices = new Map<string, HistoricalPrice>();

  constructor() {
    console.log('init CreateDemoAccountService');
  }

  initService = async (transactionLimit = 20, watchListLimit = 30): Promise<void> => {
    this.symbolToTransact = await this.#getRandomSymbolSummaries(transactionLimit);
    this.watchListSymbols = await this.#getRandomSymbolSummaries(watchListLimit);
  };

  generatePortfolioGrowthData = async (userData: UserData, transactions: PortfolioTransaction[]): Promise<void> => {
    const yesterDay = getYesterdaysDate();
    const transactionStart = getTransactionsStartDate(transactions);

    // load historical data for each symbol
    const historicalPricesPromise = await Promise.allSettled(
      transactionStart.map((d) => getHistoricalPricesOnDateCF(d.symbol, format(d.startDate, 'yyyy-MM-dd'), yesterDay)),
    );

    // filter fulfilled promises
    const historicalPrices = historicalPricesPromise
      .filter((d): d is PromiseFulfilledResult<HistoricalPriceSymbol> => d.status === 'fulfilled')
      .map((d) => d.value)
      .reduce((acc, curr) => ({ ...acc, [curr.symbol]: curr.data }), {} as { [key: string]: HistoricalPrice[] });

    // get portfolio growth assets
    const portfolioGrowthAssets = getPortfolioGrowthAssets(transactions, historicalPrices);

    // get holidays
    const allHolidays = (await getIsMarketOpenCF())?.allHolidays ?? [];

    // get portfolio growth data
    const portfolioGrowth = getPortfolioGrowth(
      portfolioGrowthAssets,
      userData.portfolioState.startingCash,
      allHolidays,
    );

    // save data into user document
    await userDocumentPortfolioGrowthRef(userData.id).set({
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: portfolioGrowth,
    });
  };

  /**
   *
   * creates one buy and one sell transaction for each symbol
   * @param userData
   */
  generateTransactionsForRandomSymbols = async (userData: UserData): Promise<PortfolioTransaction[]> => {
    // save all created transactions
    const transactionsToSave: PortfolioTransaction[] = [];

    const pastDateBuy = getCurrentDateDetailsFormat(subDays(new Date(), 30));
    const pastDateSell = getCurrentDateDetailsFormat(subDays(new Date(), 4));

    // create BUY transactions for each symbol
    const buyOperations = this.symbolToTransact.map(
      (symbol) =>
        ({
          symbol: symbol.id,
          sector: symbol.profile?.sector ?? 'Unknown',
          symbolType: 'STOCK',
          units: getRandomNumber(10, 32),
          createdAt: pastDateBuy,
          displaySymbol: symbol.id,
          orderId: uuidv4(),
          orderType: { type: 'BUY' },
          potentialSymbolPrice: 1, // todo - maybe wrong
          potentialTotalPrice: 1, // todo - maybe wrong
          closedAt: null,
          status: 'OPEN',
          userData: userData,
        }) satisfies OutstandingOrder,
    );

    // load all transactions at once
    const buyTransactions = await Promise.all(
      buyOperations.map((operation) => this.createPortfolioCreateOperation(operation, userData, transactionsToSave)),
    );

    // determine if user has enough cash to buy
    for (const buyTransaction of buyTransactions) {
      try {
        // how much was already spent on all transactions
        const alreadySpent = transactionsToSave.reduce((acc, curr) => acc + curr.unitPrice * curr.units, 0);

        // check if user has enough cash to buy
        const hasCash =
          userData.portfolioState.cashOnHand - alreadySpent - buyTransaction.unitPrice * buyTransaction.units > 0;

        // only save if cash will not be negative for demo trading accounts
        if (hasCash || userData.userAccountType !== UserAccountEnum.DEMO_TRADING) {
          transactionsToSave.push(buyTransaction);
        }
      } catch (err) {
        console.log(`Symbol: ${buyTransaction.symbol} - skip transactions for user: ${userData.personal.displayName}`);
      }
    }

    console.log('Created BUY transactions:', transactionsToSave.length);

    // map data into new object to avoid circular reference
    const sellOperations = transactionsToSave
      .map((d) => ({ symbol: d.symbol, sector: d.sector, units: d.units }))
      .map(
        (operation) =>
          ({
            symbol: operation.symbol,
            sector: operation.sector ?? 'Unknown',
            symbolType: 'STOCK',
            units: Math.round(operation.units / 2),
            orderId: uuidv4(),
            orderType: { type: 'SELL' },
            potentialSymbolPrice: 1, // todo - maybe wrong
            potentialTotalPrice: 1, // todo - maybe wrong
            closedAt: null,
            status: 'OPEN',
            userData: userData,
            createdAt: pastDateSell,
            displaySymbol: operation.symbol,
          }) satisfies OutstandingOrder,
      );

    // load all transactions at once
    const sellTransactions = await Promise.all(
      sellOperations.map((operation) => this.createPortfolioCreateOperation(operation, userData, transactionsToSave)),
    );

    console.log('Created SELL transactions:', sellTransactions.length);

    // save them
    transactionsToSave.push(...sellTransactions);

    // save transaction into user document at once
    await userDocumentTransactionHistoryRef(userData.id).update({
      transactions: transactionsToSave,
    } satisfies UserPortfolioTransaction);

    return transactionsToSave;
  };

  #getHistoricalPrice = async (symbol: string, date: string): Promise<HistoricalPrice> => {
    const cacheKey = `${symbol}_${date}`;

    // check if data already loaded
    const cachedData = this.symbolHistoricalPrices.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // load historical price for symbol on date
    const symbolPrice = await getStockHistoricalPricesOnDateCF(symbol, dateFormatDate(date));
    console.log('loaded historical price for symbol:', symbol, 'date:', date);

    // check if symbol exists
    if (!symbolPrice) {
      throw new HttpsError('aborted', SYMBOL_NOT_FOUND_ERROR);
    }

    // save data into cache
    this.symbolHistoricalPrices.set(cacheKey, symbolPrice);
    return symbolPrice;
  };

  createPortfolioCreateOperation = async (
    data: OutstandingOrder,
    userData: UserData,
    userTransactions: PortfolioTransaction[],
  ): Promise<PortfolioTransaction> => {
    const symbolPrice = await this.#getHistoricalPrice(data.symbol, data.createdAt);

    // from previous transaction calculate invested and units - currently if I own that symbol
    const symbolHolding = this.#getCurrentInvestedFromTransactions(data.symbol, userTransactions);
    //const symbolHoldingBreakEvenPrice = roundNDigits(symbolHolding.invested / symbolHolding.units, 2);

    // create transaction
    const transaction = createTransaction(userData, data, symbolPrice.close);

    // return data
    return transaction;
  };

  #getCurrentInvestedFromTransactions = (
    symbol: string,
    userTransactions: PortfolioTransaction[],
  ): { units: number; invested: number } => {
    return userTransactions
      .filter((d) => d.symbol === symbol)
      .reduce(
        (acc, curr) => ({
          ...acc,
          invested: roundNDigits(
            acc.invested +
              (curr.transactionType === 'BUY' ? curr.unitPrice * curr.units : -curr.unitPrice * curr.units),
          ),
          units: acc.units + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
        }),
        { invested: 0, units: 0 } as { units: number; invested: number },
      );
  };

  // #createTransaction = (
  //   userDocData: UserData,
  //   input: OutstandingOrder,
  //   historicalPrice: HistoricalPrice,
  //   breakEvenPrice: number,
  // ): PortfolioTransaction => {
  //   const isTransactionFeesActive = userDocData.userAccountType === UserAccountEnum.DEMO_TRADING;

  //   // if custom total value is provided calculate unit price, else use API price
  //   const unitPrice =  historicalPrice.close;

  //   const isSell = input.transactionType === 'SELL';
  //   const returnValue = isSell ? roundNDigits((unitPrice - breakEvenPrice) * input.units) : 0;
  //   const returnChange = isSell ? calculateGrowth(unitPrice, breakEvenPrice) : 0;

  //   // transaction fees are 0.01% of the transaction value
  //   const transactionFeesCalc = isTransactionFeesActive ? ((input.units * unitPrice) / 100) * TRANSACTION_FEE_PRCT : 0;
  //   const transactionFees = roundNDigits(transactionFeesCalc, 2);

  //   const result: PortfolioTransaction = {
  //     transactionId: uuidv4(),
  //     date: input.date,
  //     symbol: input.symbol,
  //     units: input.units,
  //     transactionType: input.transactionType,
  //     userId: userDocData.id,
  //     symbolType: input.symbolType,
  //     unitPrice,
  //     transactionFees,
  //     returnChange,
  //     returnValue,
  //     priceFromDate: historicalPrice.date,
  //     sector: input.sector,
  //     dateExecuted: getCurrentDateDetailsFormat(),
  //     displaySymbol: input.symbol.replace(input.symbolType === 'CRYPTO' ? 'USD' : '', ''),
  //   };

  //   return result;
  // };

  createRandomUser = (data: {
    isDemo?: boolean;
    password: string;
    isTest?: boolean;
    email?: string;
    name?: string;
  }): Promise<UserRecord> => {
    const idPrefix = data.isDemo ? 'demo_' : data.isTest ? 'test_' : 'user_';
    const namePrefix = data.isDemo ? 'demo_' : '';

    return getAuth().createUser({
      uid: `${idPrefix}${faker.string.uuid()}`,
      email: data.email ?? `${idPrefix}${faker.internet.email()}`,
      emailVerified: true,
      password: data.password,
      displayName: data.name ?? `${namePrefix}${faker.internet.userName()}`,
      photoURL: faker.image.avatar(),
      disabled: false,
    });
  };

  createWatchListWithRandomSymbols = async (userData: UserData): Promise<void> => {
    // add symbols to watchlist
    await userDocumentWatchListRef(userData.id).set({
      createdDate: getCurrentDateDefaultFormat(),
      data: this.watchListSymbols.map((symbol) => ({
        symbol: symbol.id,
        symbolType: 'STOCK',
        sector: symbol.profile?.sector ?? 'Unknown',
      })),
    });
  };

  #getRandomSymbolSummaries = async (limit: number): Promise<SymbolSummary[]> => {
    const randomSymbols = this.#getSymbols().slice(0, limit);
    const summaries = await getSymbolSummariesCF(randomSymbols);

    console.log('Random symbols:', randomSymbols.length, 'Summaries:', summaries.length);

    return summaries;
  };

  #getSymbols = () => {
    // list of symbols
    const symbols = [
      'AAPL',
      'AAL',
      'GOOGL',
      'MSFT',
      'TSLA',
      'META',
      'LYFT',
      'BABA',
      'JPM',
      'V',
      'PYPL',
      'INTC',
      'CSCO',
      'IBM',
      'DIS',
      'BA',
      'VZ',
      'BAC',
      'C',
      'LOW',
      'COST',
      'WBA',
      'ABT',
      'JNJ',
      'AZN',
      'T',
      'VZ',
      'TMUS',
      'NFLX',
      'EA',
      'SNE',
      'AMD',
      'MU',
      'QCOM',
      'TSM',
      'ADBE',
      'ORCL',
      'CRM',
      'AMAT',
      'UBER',
    ];
    return symbols;
  };
}
