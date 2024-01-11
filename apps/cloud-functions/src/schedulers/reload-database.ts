import { faker } from '@faker-js/faker';
import { PortfolioTransactionCreate, UserAccountTypes, UserData } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { addDays, format, subDays } from 'date-fns';
import { firestore } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { userDocumentWatchListRef } from '../models';
import { createPortfolioCreateOperation } from '../portfolio';
import { resetTransactionsForUser, userCreate } from '../user';
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

  for (let i = 0; i < 3; i++) {
    await createUserData();
    // wait some seconds to avoid frequent calls into financial modeling api
    await waitNSeconds(2);
  }

  console.log('CREATE NEW USERS - DONE');

  // TODO - create new groups

  // TODO - run all schedulers

  const endTime = performance.now();
  const secondsDiff = (endTime - startTime) / 1000;
  console.log(`Function took: ${secondsDiff} seconds`);
};

const waitNSeconds = async (seconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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
const createUserData = async (): Promise<UserData[]> => {
  const userDataArray: UserData[] = [];

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
  await resetTransactionsForUser(userData, UserAccountTypes.Trading);

  // add symbols to watchlist
  const watchListSymbols = getStockSymbol(50);
  await userDocumentWatchListRef(user.uid).set({
    createdDate: getCurrentDateDefaultFormat(),
    data: watchListSymbols.map((symbol) => ({
      symbol,
      symbolType: 'STOCK',
    })),
  });

  // generate transactions
  await generateTransaction(userData);

  // save user
  userDataArray.push(userData);

  // return data
  return userDataArray;
};

/**
 *
 * creates one buy and one sell transaction for each symbol
 * @param userData
 */
const generateTransaction = async (userData: UserData): Promise<void> => {
  const randomSymbols = getStockSymbol(10);

  for await (const symbol of randomSymbols) {
    console.log('symbol', symbol);
    const pastDate = subDays(new Date(), getRandomNumber(50, 100));

    const buyOperation: PortfolioTransactionCreate = {
      date: format(pastDate, 'yyyy-MM-dd'),
      symbol,
      symbolType: 'STOCK',
      units: getRandomNumber(20, 40),
      transactionType: 'BUY',
    };

    const sellOperation: PortfolioTransactionCreate = {
      date: format(addDays(pastDate, 30), 'yyyy-MM-dd'),
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

const getRandomNumber = (min: number, max: number): number => {
  return Math.ceil(Math.random() * (max - min) + min);
};

const getStockSymbol = (limit: number): string[] => {
  // list of symbols
  const symbols = [
    'AAPL',
    'AMZN',
    'GOOGL',
    'MSFT',
    'TSLA',
    'FB',
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
    'CMCSA',
    'VZ',
    'PEP',
    'KO',
    'GOOG',
    'ABBV',
    'CVX',
    'XOM',
    'PG',
    'MRK',
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
    'MRNA',
    'AZN',
    'PFE',
    'T',
    'VZ',
    'TMUS',
    'S',
    'NFLX',
    'ATVI',
    'EA',
    'TTWO',
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
    'WORK',
    'ZM',
    'UBER',
    'LYFT',
    'BA',
    'LMT',
    'RTX',
    'NOC',
    'GD',
    'LHX',
    'HON',
    'GE',
    'MMM',
    'CAT',
    'UNP',
    'CSX',
    'NSC',
    'FDX',
    'UPS',
    'GLW',
    'TEL',
    'AAPL',
    'SAMSUNG',
    'TM',
    'HMC',
    'F',
    'GM',
    'TSLA',
    'FORD',
    'NIO',
    'GM',
    'ABBV',
    'GILD',
    'BMY',
    'CELG',
    'REGN',
    'BIIB',
    'MRK',
    'AMGN',
    'JNJ',
    'PFE',
    'LLY',
    'NVS',
    'AZN',
    'ABBV',
    'GSK',
    'SNY',
    'ABBOTT',
    'GILD',
    'AMGN',
    'BIIB',
    'CELG',
    'REGN',
    'BMY',
    'LLY',
    'ABBOTT',
    'SNY',
    'GSK',
    'NVS',
    'V',
    'MA',
    'AXP',
    'PYPL',
    'SQ',
    'WFC',
    'JPM',
    'GS',
    'BAC',
    'C',
    'MS',
    'VLO',
    'CVX',
    'XOM',
    'COP',
    'TOT',
    'RDS-A',
    'BP',
    'HAL',
    'SLB',
    'APA',
    'EOG',
    'OXY',
    'DVN',
    'NOV',
    'MRO',
    'COP',
    'CXO',
    'PSX',
    'KMI',
    'XOM',
    'CVX',
    'TOT',
    'RDS-A',
    'BP',
    'ECL',
    'CLX',
    'KMB',
    'PG',
    'CL',
    'HSY',
    'KO',
    'PEP',
    'NKE',
    'LULU',
    'UAA',
    'NKE',
    'SBUX',
    'MCD',
    'CMG',
    'YUM',
    'QSR',
    'WEN',
    'JACK',
    'DPZ',
    'MCD',
    'YUM',
    'CMG',
    'SBUX',
    'QSR',
    'NKE',
    'UA',
    'LULU',
    'VFC',
    'GPS',
    'ANF',
    'AEO',
    'URBN',
    'ZARA',
    'LVMUY',
    'LUX',
    'EL',
    'COTY',
    'REV',
    'CCL',
    'RCL',
    'NCLH',
    'DIS',
    'T',
    'TMUS',
    'S',
    'VZ',
    'CIEN',
    'AMZN',
    'NFLX',
    'DIS',
    'CMCSA',
  ];

  const randomSymbols = symbols.sort(() => 0.5 - Math.random()).slice(0, limit);
  return randomSymbols;
};

/**
 * TODO:
 *  - add new users - 100x
 * - add new groups - 10x
 *    - manually add  portfolio_snapshot for each group on multiple dates
 * - add new transactions for each users
 * - run all schedulers
 */
