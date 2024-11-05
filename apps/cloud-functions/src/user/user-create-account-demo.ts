import { faker } from '@faker-js/faker';
import {
  getHistoricalPricesOnDateCF,
  getIsMarketOpenCF,
  getSymbolQuotesCF,
  getSymbolSummariesCF,
} from '@mm/api-external';
import {
  HistoricalPrice,
  OutstandingOrder,
  PortfolioGrowth,
  PortfolioGrowthAssets,
  PortfolioTransaction,
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
  fillOutMissingDatesForDate,
  getCurrentDateDefaultFormat,
  getCurrentDateDetailsFormat,
  getPortfolioGrowthAssets,
  getPortfolioStateHoldingBaseByTransactionsUtil,
  getRandomNumber,
  getTransactionsStartDate,
  getYesterdaysDate,
  roundNDigits,
  transformPortfolioStateHoldingToPortfolioState,
} from '@mm/shared/general-util';
import { format, subDays } from 'date-fns';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import {
  userCollectionDemoAccountRef,
  userDocumentPortfolioGrowthRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
  userDocumentWatchListRef,
} from '../database';
import { getPortfolioStateHoldingsUtil } from '../portfolio';
import { userPortfolioRisk } from '../portfolio/portfolio-risk-evaluation';
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
    // save holdings

    // create portfolio growth data
    demoService.generatePortfolioGrowthData(newUser, transactions);
    console.log('Generated portfolio growth, user:', newUser.personal.displayName);
  });

  return { userData: newUser, password: randomPassword };
};

export class CreateDemoAccountService {
  private symbolToTransact: SymbolSummary[] = [];
  private watchListSymbols: SymbolSummary[] = [];
  // symbol -> historical (closed) prices
  private symbolHistoricalPrices = new Map<string, HistoricalPrice[]>();

  private pastDateBuy!: string;
  private pastDateSell!: string;

  constructor() {
    console.log('init CreateDemoAccountService');
  }

  initService = async (transactionLimit = 20, watchListLimit = 30): Promise<void> => {
    this.symbolToTransact = await this.#getRandomSymbolSummaries(transactionLimit);
    this.watchListSymbols = await this.#getRandomSymbolSummaries(watchListLimit);

    this.pastDateBuy = getCurrentDateDetailsFormat(subDays(new Date(), 30));
    this.pastDateSell = getCurrentDateDetailsFormat(subDays(new Date(), 4));

    console.log(`Selected date for buy: ${this.pastDateBuy}, sell: ${this.pastDateSell}`);

    await this.#preloadHistoricalPrices();
  };

  generatePortfolioGrowthData = async (userData: UserData, transactions: PortfolioTransaction[]): Promise<void> => {
    // get start date of each transaction - should be the same for all symbols
    const transactionStart = getTransactionsStartDate(transactions);

    // load historical data for each symbol
    const historicalPricesPromise = transactionStart.map((d) => ({
      symbol: d.symbol,
      data: this.symbolHistoricalPrices.get(d.symbol),
    }));

    // filter fulfilled promises
    const historicalPrices = historicalPricesPromise.reduce(
      (acc, curr) => ({ ...acc, [curr.symbol]: curr.data! }),
      {} as { [key: string]: HistoricalPrice[] },
    );

    // get portfolio growth assets
    const portfolioGrowthAssets = getPortfolioGrowthAssets(transactions, historicalPrices);

    // get holidays
    const allHolidays = (await getIsMarketOpenCF())?.allHolidays ?? [];

    // get portfolio growth data
    const portfolioGrowth = this.getPortfolioGrowth(
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

    const buyOperations: OutstandingOrder[] = [];

    // create BUY transactions for each symbol
    for (const symbol of this.symbolToTransact) {
      console.log('Creating transactions for symbol:', symbol.id);
      const price = this.#getHistoricalPrice(symbol.id, this.pastDateBuy);
      const units = getRandomNumber(10, 32);

      // create BUY transaction
      const order = {
        symbol: symbol.id,
        sector: symbol.profile?.sector ?? 'Unknown',
        symbolType: 'STOCK',
        units: units,
        createdAt: this.pastDateBuy,
        displaySymbol: symbol.id,
        orderId: uuidv4(),
        orderType: { type: 'BUY' },
        potentialSymbolPrice: price.close,
        potentialTotalPrice: price.close * units,
        userData: userData,
        status: 'OPEN',
      } satisfies OutstandingOrder;

      // save data
      buyOperations.push(order);
    }

    // load all transactions at once
    const buyTransactions = buyOperations
      .map((operation) => this.createPortfolioCreateOperation(operation, userData))
      .filter((d) => !!d);

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

    // update user's holdings - calculate break even price
    userData.holdingSnapshot = {
      data: getPortfolioStateHoldingBaseByTransactionsUtil(transactionsToSave),
      lastModifiedDate: getCurrentDateDefaultFormat(),
    };

    // map data into new object to avoid circular reference
    const sellOperations: OutstandingOrder[] = [];

    // create SELL transactions for each symbol
    for (const transaction of transactionsToSave) {
      console.log('Creating SELL transactions for symbol:', transaction.symbol);
      const price = this.#getHistoricalPrice(transaction.symbol, this.pastDateSell);
      const units = getRandomNumber(10, 32);

      // create SELL transaction
      const order = {
        symbol: transaction.symbol,
        sector: transaction.sector ?? 'Unknown',
        symbolType: 'STOCK',
        units: Math.round(transaction.units / 2),
        orderId: uuidv4(),
        orderType: { type: 'SELL' },
        potentialSymbolPrice: price.close,
        potentialTotalPrice: price.close * units,
        userData: userData,
        createdAt: this.pastDateSell,
        displaySymbol: transaction.symbol,
        status: 'OPEN',
      } satisfies OutstandingOrder;

      // save data
      sellOperations.push(order);
    }

    // load all transactions at once
    const sellTransactions = sellOperations
      .map((operation) => this.createPortfolioCreateOperation(operation, userData))
      .filter((d) => !!d);

    console.log('Created SELL transactions:', sellTransactions.length);

    // save them
    transactionsToSave.push(...sellTransactions);

    // save transaction into user document at once
    await userDocumentTransactionHistoryRef(userData.id).update({
      transactions: transactionsToSave,
    } satisfies UserPortfolioTransaction);

    // re-run holdings calculation with new SELL transactions
    const holdingsBaseUpdate = getPortfolioStateHoldingBaseByTransactionsUtil(transactionsToSave);

    // get symbol summaries from API
    const partialHoldingSymbols = holdingsBaseUpdate.map((d) => d.symbol);
    console.log(`Receiving symbol quotes for ${partialHoldingSymbols.length} symbols`);
    const symbolQuotes = partialHoldingSymbols.length > 0 ? await getSymbolQuotesCF(partialHoldingSymbols) : [];
    console.log(`Received symbol quotes for ${symbolQuotes.length} symbols`);

    // get portfolio state
    const portfolioStateHoldings = getPortfolioStateHoldingsUtil(transactionsToSave, holdingsBaseUpdate, symbolQuotes);

    // remove holdings
    const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHoldings);

    // calculation risk of investment
    const portfolioRisk = await userPortfolioRisk(portfolioStateHoldings);

    // update user
    userDocumentRef(userData.id).update({
      portfolioState: portfolioState,
      holdingSnapshot: {
        data: holdingsBaseUpdate,
        lastModifiedDate: getCurrentDateDefaultFormat(),
      },
    } satisfies Partial<UserData>);

    // update portfolio risk
    userDocumentRef(userData.id).update({
      portfolioRisk: portfolioRisk,
    } satisfies Partial<UserData>);

    return transactionsToSave;
  };

  /**
   *
   * @param portfolioAssets - asset data for every symbol user owned
   * @param startingCashValue - starting cash value
   * @param ignoreDates - dates to ignore (holidays)
   * @returns
   */
  getPortfolioGrowth = (
    portfolioAssets: PortfolioGrowthAssets[],
    startingCashValue = 0,
    ignoreDates: string[] = [],
  ): PortfolioGrowth[] => {
    // user has no transactions yet
    if (!portfolioAssets || portfolioAssets.length === 0) {
      return [];
    }

    // get soonest date
    const soonestDate = portfolioAssets.reduce(
      (acc, curr) => (curr.data[0].date < acc ? curr.data[0].date : acc),
      getYesterdaysDate(),
    );

    // generate dates from soonest until today
    const generatedDates = fillOutMissingDatesForDate(soonestDate, getYesterdaysDate());

    // result of portfolio growth
    const result: PortfolioGrowth[] = [];

    // accumulate return values, because it is increasing per symbol - {symbol: accumulatedReturn}
    const accumulatedReturn = new Map<string, number>();

    // loop though all generated dates
    for (const gDate of generatedDates) {
      // check if holiday
      if (ignoreDates.includes(gDate)) {
        continue;
      }

      // initial object
      const portfolioItem: PortfolioGrowth = {
        date: gDate,
        investedTotal: 0,
        marketTotal: 0,
        balanceTotal: startingCashValue,
      };

      // loop though all portfolio assets per date
      for (const portfolioAsset of portfolioAssets) {
        // find current portfolio asset on this date
        const currentPortfolioAsset = portfolioAsset.data.find((d) => d.date === gDate);

        // not found
        if (!currentPortfolioAsset) {
          continue;
        }

        // save accumulated return
        accumulatedReturn.set(portfolioAsset.symbol, currentPortfolioAsset.accumulatedReturn);

        // add values to initial object
        portfolioItem.marketTotal += currentPortfolioAsset.marketTotal;
        portfolioItem.investedTotal += currentPortfolioAsset.investedTotal;
        portfolioItem.balanceTotal += currentPortfolioAsset.marketTotal - currentPortfolioAsset.investedTotal;
      }

      // add accumulated return to total balance
      portfolioItem.balanceTotal += Array.from(accumulatedReturn.entries()).reduce((acc, curr) => acc + curr[1], 0);

      // round values
      portfolioItem.balanceTotal = roundNDigits(portfolioItem.balanceTotal);
      portfolioItem.marketTotal = roundNDigits(portfolioItem.marketTotal);
      portfolioItem.investedTotal = roundNDigits(portfolioItem.investedTotal);

      // save result
      result.push(portfolioItem);
    }

    return result;
  };

  #getHistoricalPrice = (symbol: string, date: string): HistoricalPrice => {
    const usedDate = format(new Date(date), 'yyyy-MM-dd');
    // check if data already loaded
    const cachedData = this.symbolHistoricalPrices.get(symbol);

    if (!cachedData) {
      throw new Error(`Historical price not found for symbol ${symbol} on date ${usedDate}`);
    }

    // check if date is sooner than the first date in the data
    if (usedDate < cachedData[0].date) {
      console.log(`Historical price not found for symbol ${symbol} on date ${usedDate}, returning first date`);
      return cachedData[0];
    }

    // filter out data on date
    const data = cachedData.find((d) => d.date >= usedDate);

    if (!data) {
      throw new Error(`Historical price not found for symbol ${symbol} on date ${usedDate}`);
    }

    return data;
  };

  /**
   * preloads historical prices for all symbols that user will transact
   */
  #preloadHistoricalPrices = async (): Promise<void> => {
    const endDateValue = getYesterdaysDate();
    const dateStart = format(this.pastDateBuy, 'yyyy-MM-dd');

    // load historical prices
    const historicalPricesPromises = Promise.allSettled(
      this.symbolToTransact.map((symbol) => getHistoricalPricesOnDateCF(symbol.id, dateStart, endDateValue)),
    );

    // filter fulfilled promises
    const historicalPrices = (await historicalPricesPromises)
      .filter((d) => d.status === 'fulfilled')
      .map((d) => d.value)
      .filter((d) => !!d);

    // saved data into cache
    for (const data of historicalPrices) {
      this.symbolHistoricalPrices.set(data.symbol, data.data);
    }
  };

  createPortfolioCreateOperation = (data: OutstandingOrder, userData: UserData): PortfolioTransaction | null => {
    try {
      const symbolPrice = this.#getHistoricalPrice(data.symbol, data.createdAt);

      // create transaction
      const transaction = createTransaction(userData, data, symbolPrice.close);

      // return data
      return transaction;
    } catch (err) {
      console.log('Error creating transaction:', err);
      return null;
    }
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
