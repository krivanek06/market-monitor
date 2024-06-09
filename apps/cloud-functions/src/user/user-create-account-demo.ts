import { faker } from '@faker-js/faker';
import { getStockHistoricalPricesOnDate, getSymbolSummaries } from '@mm/api-external';
import {
  HistoricalPrice,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  SymbolSummary,
  TRANSACTION_FEE_PRCT,
  USER_ALLOWED_DEMO_ACCOUNTS_PER_IP,
  UserAccountBasicTypes,
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
  getRandomNumber,
  roundNDigits,
} from '@mm/shared/general-util';
import { format, isBefore, isSameDay, subDays } from 'date-fns';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import { userCollectionDemoAccountRef, userDocumentTransactionHistoryRef, userDocumentWatchListRef } from '../models';
import { userCreate } from './user-create-account';

export const userCreateAccountDemoCall = onCall(
  async (request: CallableRequest<UserCreateDemoAccountInput>): Promise<UserDataDemoData> => {
    // check how many demo accounts are created per IP
    const demoAccounts = await userCollectionDemoAccountRef()
      .where('userPrivateInfo.publicIP', '==', request.data.publicIP)
      .get();

    console.log('demoAccounts', demoAccounts.docs.length, 'from IP', request.data.publicIP);

    // throw error if too many demo accounts are created
    if (demoAccounts.docs.length > USER_ALLOWED_DEMO_ACCOUNTS_PER_IP) {
      throw new HttpsError('aborted', 'Too many demo accounts created from this IP');
    }

    // create random password
    const randomPassword = faker.internet.password();

    const demoService = new CreateDemoAccountService();
    await demoService.initService(12, 20);

    // create new demo user
    const newUser = await demoService.createRandomUserAccounts({
      isDemo: true,
      userAccountType: request.data.accountType,
      password: randomPassword,
      publicIP: request.data.publicIP,
    });

    // create watchList
    await demoService.createWatchListWithRandomSymbols(newUser);

    // generate transactions
    await demoService.generateTransactionsForRandomSymbols(newUser);

    return { userData: newUser, password: randomPassword };
  },
);

export class CreateDemoAccountService {
  private symbolToTransact: SymbolSummary[] = [];
  private watchListSymbols: SymbolSummary[] = [];
  private symbolHistoricalPrices = new Map<string, HistoricalPrice>();

  initService = async (transactionLimit = 25, watchListLimit = 30): Promise<void> => {
    this.symbolToTransact = await this.getRandomSymbolSummaries(transactionLimit);
    this.watchListSymbols = await this.getRandomSymbolSummaries(watchListLimit);
  };

  /**
   *
   * @param data
   * @param transactionSymbols - list of symbols to use for user's transactions
   * @param watchListSymbols  - list of symbols to use for user's watchlist
   * @returns
   */
  createRandomUserAccounts = async (data: {
    userAccountType: UserAccountBasicTypes;
    isDemo: boolean;
    password: string;
    publicIP?: string;
  }): Promise<UserData> => {
    // create demo accounts
    const newDemoUser = await this.createRandomUser(data.isDemo, data.password);

    // create user document
    const userData = await userCreate(newDemoUser, {
      isDemo: !!data.isDemo,
      userAccountType: data.userAccountType,
      publicIP: data.publicIP,
    });

    return userData;
  };

  /**
   *
   * creates one buy and one sell transaction for each symbol
   * @param userData
   */
  generateTransactionsForRandomSymbols = async (userData: UserData): Promise<void> => {
    const userDocTransactionsRef = userDocumentTransactionHistoryRef(userData.id);

    const transactionsToSave: PortfolioTransaction[] = [];

    const pastDateBuy = format(subDays(new Date(), 200), 'yyyy-MM-dd');
    const pastDateSell = format(subDays(new Date(), 140), 'yyyy-MM-dd');

    for await (const symbol of this.symbolToTransact) {
      const buyOperation: PortfolioTransactionCreate = {
        date: pastDateBuy,
        symbol: symbol.id,
        sector: symbol.profile?.sector ?? 'Unknown',
        symbolType: 'STOCK',
        units: getRandomNumber(12, 15),
        transactionType: 'BUY',
      };

      const sellOperation: PortfolioTransactionCreate = {
        date: pastDateSell,
        symbol: symbol.id,
        sector: symbol.profile?.sector ?? 'Unknown',
        symbolType: 'STOCK',
        units: getRandomNumber(5, 8),
        transactionType: 'SELL',
      };

      try {
        const t1 = await this.createPortfolioCreateOperation(buyOperation, userData, transactionsToSave);
        transactionsToSave.push(t1);

        const t2 = await this.createPortfolioCreateOperation(sellOperation, userData, transactionsToSave);
        transactionsToSave.push(t2);
      } catch (err) {
        console.log(`Symbol: ${symbol.id} - skip transactions for user: ${userData.personal.displayName}`);
      }
    }

    // save transaction into user document at once
    userDocTransactionsRef.update({ transactions: transactionsToSave } satisfies UserPortfolioTransaction);
  };

  getHistoricalPrice = async (symbol: string, date: string): Promise<HistoricalPrice> => {
    const cacheKey = `${symbol}_${date}`;

    // check if data already loaded
    const cachedData = this.symbolHistoricalPrices.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // load historical price for symbol on date
    const symbolPrice = await getStockHistoricalPricesOnDate(symbol, dateFormatDate(date));

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
    const symbolPrice = await this.getHistoricalPrice(data.symbol, data.date);

    // check if user has enough cash to buy
    if (data.transactionType === 'BUY' && userData.userAccountType === UserAccountEnum.DEMO_TRADING) {
      const symbolTotalValue = data.units * symbolPrice.close;
      const transactionSpent = userTransactions
        .filter((d) => isBefore(d.date, symbolPrice.date) || isSameDay(d.date, symbolPrice.date))
        .reduce(
          (acc, curr) =>
            acc + (curr.transactionType === 'BUY' ? curr.unitPrice * curr.units : -curr.unitPrice * curr.units),
          0,
        );
      const cashOnHand = userData.portfolioState.startingCash - transactionSpent;
      if (symbolTotalValue > cashOnHand) {
        throw new HttpsError('aborted', 'Not enough cash to buy');
      }
    }

    // from previous transaction calculate invested and units - currently if I own that symbol
    const symbolHolding = this.getCurrentInvestedFromTransactions(data.symbol, userTransactions);
    const symbolHoldingBreakEvenPrice = roundNDigits(symbolHolding.invested / symbolHolding.units, 2);

    // create transaction
    const transaction = this.createTransaction(userData, data, symbolPrice, symbolHoldingBreakEvenPrice);

    // return data
    return transaction;
  };

  getCurrentInvestedFromTransactions = (
    symbol: string,
    userTransactions: PortfolioTransaction[],
  ): { units: number; invested: number } => {
    return userTransactions
      .filter((d) => d.symbol === symbol)
      .reduce(
        (acc, curr) => ({
          ...acc,
          invested:
            acc.invested +
            (curr.transactionType === 'BUY' ? curr.unitPrice * curr.units : -curr.unitPrice * curr.units),
          units: acc.units + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
        }),
        { invested: 0, units: 0 } as { units: number; invested: number },
      );
  };

  createTransaction = (
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
    };

    return result;
  };

  createRandomUser = (isDemo: boolean, password: string): Promise<UserRecord> => {
    const namePrefix = isDemo ? 'demo_' : 'user_';

    return getAuth().createUser({
      uid: `${namePrefix}${faker.string.uuid()}`,
      email: `${namePrefix}${faker.internet.email()}`,
      emailVerified: true,
      password: password,
      displayName: `${namePrefix}${faker.person.fullName()}`,
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

  getRandomSymbolSummaries = async (limit: number): Promise<SymbolSummary[]> => {
    const symbols = this.getSymbols();
    const randomSymbols = symbols.sort(() => 0.5 - Math.random()).slice(0, limit);
    const summaries = await getSymbolSummaries(randomSymbols);

    console.log('Random symbols:', randomSymbols, 'Summaries:', summaries.length);

    return summaries;
  };

  getSymbols = () => {
    // list of symbols
    const symbols = [
      'AAPL',
      'AMZN',
      'GOOGL',
      'MSFT',
      'TSLA',
      'META',
      'NVDA',
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
