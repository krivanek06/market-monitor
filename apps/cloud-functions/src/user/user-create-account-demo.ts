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
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  SymbolSummary,
  TRANSACTION_FEE_PRCT,
  USER_ALLOWED_DEMO_ACCOUNTS_PER_IP,
  USER_ALLOWED_DEMO_ACCOUNTS_TOTAL,
  UserAccountEnum,
  UserCreateDemoAccountInput,
  UserData,
  UserDataDemoData,
  UserPortfolioTransaction,
} from '@mm/api-types';
import {
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
} from '../models';
import { userCreate } from './user-create-account';

export const userCreateAccountDemo = async (data: UserCreateDemoAccountInput): Promise<UserDataDemoData> => {
  // check how many demo accounts are created per IP
  const demoAccountsTotal = await userCollectionDemoAccountRef().get();
  const demoAccountsPerIp = demoAccountsTotal.docs.filter((d) => d.data().userPrivateInfo.publicIP === data.publicIP);

  console.log('demoAccounts', demoAccountsPerIp.length, 'from IP', data.publicIP);

  // throw error if too many demo accounts are created
  if (demoAccountsPerIp.length > USER_ALLOWED_DEMO_ACCOUNTS_PER_IP) {
    throw new HttpsError('aborted', 'Too many demo accounts created from this IP');
  }

  // throw error if too many accounts
  if (demoAccountsTotal.docs.length >= USER_ALLOWED_DEMO_ACCOUNTS_TOTAL) {
    throw new HttpsError('aborted', 'Too many demo accounts created for not, try later');
  }

  // create random password
  const randomPassword = faker.internet.password();

  const demoService = new CreateDemoAccountService();
  await demoService.initService(18, 20);

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

  // create watchList
  demoService.createWatchListWithRandomSymbols(newUser);

  // generate transactions in async
  demoService.generateTransactionsForRandomSymbols(newUser).then((transactions) => {
    // create portfolio growth data
    demoService.generatePortfolioGrowthData(newUser, transactions);
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

    const pastDateBuy = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const pastDateSell = format(subDays(new Date(), 4), 'yyyy-MM-dd');

    // create BUY transactions for each symbol
    for (const symbol of this.symbolToTransact) {
      const buyOperation: PortfolioTransactionCreate = {
        date: pastDateBuy,
        symbol: symbol.id,
        sector: symbol.profile?.sector ?? 'Unknown',
        symbolType: 'STOCK',
        units: getRandomNumber(10, 40),
        transactionType: 'BUY',
      };

      try {
        const buyTransaction = await this.createPortfolioCreateOperation(buyOperation, userData, transactionsToSave);

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
        console.log(`Symbol: ${symbol.id} - skip transactions for user: ${userData.personal.displayName}`);
      }
    }

    // map data into new object to avoid circular reference
    const buyTransactionData = transactionsToSave.map((d) => ({ symbol: d.symbol, sector: d.sector, units: d.units }));

    // create SELL transactions for each symbol
    for (const transaction of buyTransactionData) {
      const sellOperation: PortfolioTransactionCreate = {
        date: pastDateSell,
        symbol: transaction.symbol,
        sector: transaction.sector ?? 'Unknown',
        symbolType: 'STOCK',
        // sell half of the units
        units: getRandomNumber(8, Math.round(transaction.units / 2)),
        transactionType: 'SELL',
      };

      // check if not selling more than user has
      if (sellOperation.units > transaction.units) {
        console.log(`Symbol: ${sellOperation.symbol} - skip transactions for user: ${userData.personal.displayName}`);
        continue;
      }

      try {
        const sellTransaction = await this.createPortfolioCreateOperation(sellOperation, userData, transactionsToSave);
        transactionsToSave.push(sellTransaction);
      } catch (err) {
        console.log(`Symbol: ${sellOperation.symbol} - skip transactions for user: ${userData.personal.displayName}`);
      }
    }

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

    // check if symbol exists
    if (!symbolPrice) {
      throw new HttpsError('aborted', SYMBOL_NOT_FOUND_ERROR);
    }

    // save data into cache
    this.symbolHistoricalPrices.set(cacheKey, symbolPrice);
    return symbolPrice;
  };

  createPortfolioCreateOperation = async (
    data: PortfolioTransactionCreate,
    userData: UserData,
    userTransactions: PortfolioTransaction[],
  ): Promise<PortfolioTransaction> => {
    const symbolPrice = await this.#getHistoricalPrice(data.symbol, data.date);

    // from previous transaction calculate invested and units - currently if I own that symbol
    const symbolHolding = this.#getCurrentInvestedFromTransactions(data.symbol, userTransactions);
    const symbolHoldingBreakEvenPrice = roundNDigits(symbolHolding.invested / symbolHolding.units, 2);

    // create transaction
    const transaction = this.#createTransaction(userData, data, symbolPrice, symbolHoldingBreakEvenPrice);

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

  #createTransaction = (
    userDocData: UserData,
    input: PortfolioTransactionCreate,
    historicalPrice: HistoricalPrice,
    breakEvenPrice: number,
  ): PortfolioTransaction => {
    const isTransactionFeesActive = userDocData.userAccountType === UserAccountEnum.DEMO_TRADING;

    // if custom total value is provided calculate unit price, else use API price
    const unitPrice = input.customTotalValue
      ? roundNDigits(input.customTotalValue / input.units)
      : historicalPrice.close;

    const isSell = input.transactionType === 'SELL';
    const returnValue = isSell ? roundNDigits((unitPrice - breakEvenPrice) * input.units) : 0;
    const returnChange = isSell ? roundNDigits((unitPrice - breakEvenPrice) / breakEvenPrice) : 0;

    // transaction fees are 0.01% of the transaction value
    const transactionFeesCalc = isTransactionFeesActive ? ((input.units * unitPrice) / 100) * TRANSACTION_FEE_PRCT : 0;
    const transactionFees = roundNDigits(transactionFeesCalc, 2);

    const result: PortfolioTransaction = {
      transactionId: uuidv4(),
      date: input.date,
      symbol: input.symbol,
      units: input.units,
      transactionType: input.transactionType,
      userId: userDocData.id,
      symbolType: input.symbolType,
      unitPrice,
      transactionFees,
      returnChange,
      returnValue,
      priceFromDate: historicalPrice.date,
      sector: input.sector,
      dateExecuted: getCurrentDateDetailsFormat(),
      displaySymbol: input.symbol.replace(input.symbolType === 'CRYPTO' ? 'USD' : '', ''),
    };

    return result;
  };

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

    console.log('Random symbols:', randomSymbols, 'Summaries:', summaries.length);

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
