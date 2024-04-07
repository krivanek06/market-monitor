import { faker } from '@faker-js/faker';
import { getStockHistoricalPricesOnDate } from '@mm/api-external';
import {
  GroupCreateInput,
  HistoricalPrice,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  USER_DEFAULT_STARTING_CASH,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import {
  createEmptyPortfolioState,
  dateFormatDate,
  formatToLastLastWorkingDate,
  getCurrentDateDefaultFormat,
  roundNDigits,
  waitSeconds,
} from '@mm/shared/general-util';
import { addDays, format, subDays } from 'date-fns';
import { firestore } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import { groupCreate, groupMemberAccept } from '../group';
import { userDocumentRef, userDocumentTransactionHistoryRef, userDocumentWatchListRef } from '../models';
import { userCreate } from '../user';
import { isFirebaseEmulator } from '../utils';
/**
 * Reload the database with new testing data
 * ONLY USE FOR TESTING / LOCAL DEVELOPMENT
 */
export const reloadDatabase = async (): Promise<void> => {
  if (!isFirebaseEmulator()) {
    console.warn('reloadDatabase() should only be used for testing / local development');
    return;
  }

  const startTime = performance.now();

  // delete previous data
  await deletePreviousData();

  // load users data
  console.log('CREATE NEW USERS - START');
  const newUsers: UserData[] = [];

  const createUsers = 30;
  for (let i = 0; i < createUsers; i++) {
    const userData = await createUserData();
    newUsers.push(userData);

    // create watchList
    await createWatchList(userData);

    // generate transactions
    await generateTransaction(userData);

    // wait 1 sec
    await waitSeconds(1);

    console.log(`User created: ${i + 1}/${createUsers}`);
  }

  console.log('CREATE NEW USERS - DONE');

  // create group data
  console.log('CREATE NEW GROUPS - START');
  await createGroups(newUsers);
  console.log('CREATE NEW GROUPS - DONE');

  const endTime = performance.now();
  const secondsDiff = Math.round((endTime - startTime) / 1000);
  console.log(`Function took: ~${secondsDiff} seconds`);
};

/**
 * for N users create one group and invite some people
 * for some people add them as members
 */
const createGroups = async (users: UserData[]): Promise<void> => {
  // get 10 random users
  const randomUsers = users.sort(() => 0.5 - Math.random()).slice(0, 10);

  // create groups for each users
  for await (const user of randomUsers) {
    // select random users who is not owner
    const randomUsersNotOwner = users
      .filter((u) => u.id !== user.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 20)
      .map((u) => u.id);

    const groupInput: GroupCreateInput = {
      groupName: faker.company.name(),
      imageUrl: faker.image.url(),
      isOwnerMember: true,
      isPublic: true,
      memberInvitedUserIds: randomUsersNotOwner,
    };

    // create groups
    const groupData = await groupCreate(groupInput, user.id);

    // select random 15 users to be members of the group
    const randomUsersNotOwnerAndMembers = randomUsersNotOwner.sort(() => 0.5 - Math.random()).slice(0, 15);
    for await (const userId of randomUsersNotOwnerAndMembers) {
      // add user to group
      await groupMemberAccept(userId, groupData.id);
    }
  }
};

const deletePreviousData = async () => {
  // auth users
  console.log('REMOVE AUTH USERS');
  const userIds = (await getAuth().listUsers()).users.map((u) => u.uid);
  await getAuth().deleteUsers(userIds);

  // users
  console.log('REMOVE USERS');
  const userDoc = firestore().collection('users');
  firestore().recursiveDelete(userDoc);

  // groups
  console.log('REMOVE GROUPS');
  const groupDoc = firestore().collection('groups');
  firestore().recursiveDelete(groupDoc);

  // aggregations
  console.log('REMOVE AGGREGATIONS');
  const aggregationDoc = firestore().collection('aggregations');
  firestore().recursiveDelete(aggregationDoc);

  console.log('DELETED PREVIOUS DATA');
};

/**
 * function do the following:
 * - create new users with trading account
 * - for each user creates transactions with historical data
 * - add data into watchList
 *
 * @returns array of user ids
 */
const createUserData = async (): Promise<UserData> => {
  // create user auth
  const user = await getAuth().createUser({
    uid: faker.string.uuid(),
    email: faker.internet.email(),
    emailVerified: true,
    password: 'test1234',
    displayName: faker.person.fullName(),
    photoURL: faker.image.avatar(),
    disabled: false,
  });

  // create user document
  const userData = await userCreate(user.uid);

  // change user type to trading
  const newUserData = {
    ...userData,
    portfolioState: {
      ...createEmptyPortfolioState(USER_DEFAULT_STARTING_CASH),
    },
    userAccountType: UserAccountEnum.DEMO_TRADING,
  } satisfies UserData;

  // reset user portfolio state
  await userDocumentRef(userData.id).update({
    ...newUserData,
  });

  // delete transactions
  await userDocumentTransactionHistoryRef(userData.id).update({
    transactions: [],
  });

  // return data
  return userData;
};

const createWatchList = async (userData: UserData): Promise<void> => {
  // add symbols to watchlist
  const watchListSymbols = getRandomSymbols(50);
  await userDocumentWatchListRef(userData.id).set({
    createdDate: getCurrentDateDefaultFormat(),
    data: watchListSymbols.map((symbol) => ({
      symbol,
      symbolType: 'STOCK',
    })),
  });
};

/**
 *
 * creates one buy and one sell transaction for each symbol
 * @param userData
 */
const generateTransaction = async (userData: UserData): Promise<void> => {
  const randomSymbols = getRandomSymbols(10);

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
      await createPortfolioCreateOperation(userData.id, buyOperation);
      await createPortfolioCreateOperation(userData.id, sellOperation);
    } catch (err) {
      console.log(`Symbol: ${symbol} - no data`);
    }
  }
};

const createPortfolioCreateOperation = async (
  userAuthId: string,
  data: PortfolioTransactionCreate,
): Promise<PortfolioTransaction> => {
  const userDocRef = userDocumentRef(userAuthId);
  const userDocTransactionsRef = userDocumentTransactionHistoryRef(userAuthId);

  const userDocData = (await userDocRef.get()).data();
  const userTransactions = (await userDocTransactionsRef.get()).data()?.transactions;

  // check if user exists
  if (!userDocData || !userTransactions) {
    throw new HttpsError('not-found', 'User does not exist');
  }

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
  const transaction = createTransaction(userDocData, data, symbolPrice, symbolHoldingBreakEvenPrice);

  // save transaction into user document
  userDocTransactionsRef.update({ transactions: [...userTransactions, transaction] });

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

const getRandomNumber = (min: number, max: number): number => {
  return Math.ceil(Math.random() * (max - min) + min);
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

/**
 * TODO:
 *  - add new users - 100x
 * - add new groups - 10x
 *    - manually add  portfolio_snapshot for each group on multiple dates
 * - add new transactions for each users
 * - run all schedulers
 */
