import { faker } from '@faker-js/faker';
import { getStockHistoricalPricesOnDate } from '@mm/api-external';
import {
  HistoricalPrice,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  UserAccountBasicTypes,
  UserAccountEnum,
  UserData,
  UserDataDemoData,
  UserPortfolioTransaction,
} from '@mm/api-types';
import {
  dateFormatDate,
  formatToLastLastWorkingDate,
  getCurrentDateDefaultFormat,
  getRandomNumber,
  roundNDigits,
} from '@mm/shared/general-util';
import { addDays, format, subDays } from 'date-fns';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import { userDocumentTransactionHistoryRef, userDocumentWatchListRef } from '../models';
import { userCreate } from './user-create-account';

export const userCreateAccountDemoCall = onCall(
  async (request: CallableRequest<UserAccountBasicTypes>): Promise<UserDataDemoData> => {
    const providedAccountType = request.data;

    const randomPassword = faker.internet.password();
    const newUser = await createRandomUserAccounts({
      isDemo: true,
      userAccountType: providedAccountType,
      password: randomPassword,
    });

    return { userData: newUser, password: randomPassword };
  },
);

export const createRandomUserAccounts = async (data: {
  userAccountType: UserAccountBasicTypes;
  isDemo: boolean;
  password: string;
}): Promise<UserData> => {
  // create demo accounts
  const newDemoUser = await createRandomUser(data.isDemo, data.password);

  // create user document
  const userData = await userCreate(newDemoUser, {
    isDemo: !!data.isDemo,
    userAccountType: data.userAccountType,
  });

  // create watchList
  await createWatchListWithRandomSymbols(userData);

  // generate transactions
  await generateTransactionsForRandomSymbols(userData);

  return userData;
};

/**
 *
 * creates one buy and one sell transaction for each symbol
 * @param userData
 */
const generateTransactionsForRandomSymbols = async (userData: UserData): Promise<void> => {
  const randomSymbols = getRandomSymbols(10);

  const userDocTransactionsRef = userDocumentTransactionHistoryRef(userData.id);

  const transactionsToSave: PortfolioTransaction[] = [];

  for await (const symbol of randomSymbols) {
    // get a date 200 days before today
    const pastDate = subDays(new Date(), 200);

    const buyOperation: PortfolioTransactionCreate = {
      date: format(pastDate, 'yyyy-MM-dd'),
      symbol,
      symbolType: 'STOCK',
      units: getRandomNumber(20, 40),
      transactionType: 'BUY',
    };

    const sellOperation: PortfolioTransactionCreate = {
      date: format(addDays(pastDate, 50), 'yyyy-MM-dd'),
      symbol,
      symbolType: 'STOCK',
      units: getRandomNumber(10, 18),
      transactionType: 'SELL',
    };

    try {
      const t1 = await createPortfolioCreateOperation(buyOperation, userData, transactionsToSave);
      transactionsToSave.push(t1);

      const t2 = await createPortfolioCreateOperation(sellOperation, userData, transactionsToSave);
      transactionsToSave.push(t2);
    } catch (err) {
      console.log(`Symbol: ${symbol} - no data`);
    }
  }

  // save transaction into user document at once
  userDocTransactionsRef.update({ transactions: transactionsToSave } satisfies UserPortfolioTransaction);
};

const createPortfolioCreateOperation = async (
  data: PortfolioTransactionCreate,
  userData: UserData,
  userTransactions: PortfolioTransaction[],
): Promise<PortfolioTransaction> => {
  // if weekend is used format to last friday
  data.date = formatToLastLastWorkingDate(data.date);

  // load historical price for symbol on date
  const symbolPrice = await getStockHistoricalPricesOnDate(data.symbol, dateFormatDate(data.date));

  // check if symbol exists
  if (!symbolPrice) {
    throw new HttpsError('aborted', SYMBOL_NOT_FOUND_ERROR);
  }

  // from previous transaction calculate invested and units - currently if I own that symbol
  const symbolHolding = getCurrentInvestedFromTransactions(data.symbol, userTransactions);
  const symbolHoldingBreakEvenPrice = roundNDigits(symbolHolding.invested / symbolHolding.units, 2);

  // create transaction
  const transaction = createTransaction(userData, data, symbolPrice, symbolHoldingBreakEvenPrice);

  // return data
  return transaction;
};

const getCurrentInvestedFromTransactions = (
  symbol: string,
  userTransactions: PortfolioTransaction[],
): { units: number; invested: number } => {
  return userTransactions
    .filter((d) => d.symbol === symbol)
    .reduce(
      (acc, curr) => ({
        ...acc,
        invested:
          acc.invested + (curr.transactionType === 'BUY' ? curr.unitPrice * curr.units : -curr.unitPrice * curr.units),
        units: acc.units + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
      }),
      { invested: 0, units: 0 } as { units: number; invested: number },
    );
};

const createTransaction = (
  userDocData: UserData,
  input: PortfolioTransactionCreate,
  historicalPrice: HistoricalPrice,
  breakEvenPrice: number,
): PortfolioTransaction => {
  const isTransactionFeesActive = userDocData.userAccountType === UserAccountEnum.DEMO_TRADING;

  // if custom total value is provided calculate unit price, else use API price
  const unitPrice = input.customTotalValue ? roundNDigits(input.customTotalValue / input.units) : historicalPrice.close;

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
  };

  return result;
};

const createRandomUser = (isDemo: boolean, password: string): Promise<UserRecord> => {
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

const createWatchListWithRandomSymbols = async (userData: UserData): Promise<void> => {
  // add symbols to watchlist
  const watchListSymbols = getRandomSymbols(35);
  await userDocumentWatchListRef(userData.id).set({
    createdDate: getCurrentDateDefaultFormat(),
    data: watchListSymbols.map((symbol) => ({
      symbol,
      symbolType: 'STOCK',
    })),
  });
};

const getRandomSymbols = (limit: number) => {
  const symbols = getSymbols();
  const randomSymbols = symbols.sort(() => 0.5 - Math.random()).slice(0, limit);
  return randomSymbols;
};

const getSymbols = () => {
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
    'GS',
    'INTC',
    'CSCO',
    'IBM',
    'DIS',
    'BA',
    'WMT',
    'VZ',
    'PEP',
    'PFE',
    'WFC',
    'BAC',
    'C',
    'GS',
    'MS',
    'UPS',
    'FDX',
    'HD',
    'LOW',
    'COST',
    'TGT',
    'WBA',
    'CVS',
    'ABT',
    'JNJ',
    'AZN',
    'PFE',
    'T',
    'VZ',
    'TMUS',
    'S',
    'NFLX',
    'EA',
    'SNE',
    'AMD',
    'MU',
    'QCOM',
    'AAPL',
    'TSM',
    'ADBE',
    'ORCL',
    'CRM',
    'AMAT',
    'CSCO',
    'IBM',
    'NOW',
    'SNOW',
    'ZM',
    'UBER',
  ];
  return symbols;
};
