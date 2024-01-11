import { faker } from '@faker-js/faker';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { getAuth } from 'firebase-admin/auth';
import { groupsCollectionRef, userDocumentWatchListRef, usersCollectionRef } from '../models';
import { aggregationCollectionRef } from '../models/aggregation';
import { userCreate } from '../user';

/**
 * Reload the database with new testing data
 * ONLY USE FOR TESTING / LOCAL DEVELOPMENT
 */
export const reloadDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('reloadDatabase() should only be used for testing / local development');
    return;
  }

  const startTime = performance.now();

  // delete previous data
  await deletePreviousData();

  // // load users data
  // for (let i = 0; i < 100; i++) {
  //   await createUserData();
  // }

  // console.log('CREATE NEW USERS');

  const endTime = performance.now();
  const secondsDiff = (endTime - startTime) / 1000;
  console.log(`Function took: ${secondsDiff} seconds`);
};

const deletePreviousData = async () => {
  console.log('REMOVE AUTH USERS');
  const userIds = (await getAuth().listUsers()).users.map((u) => u.uid);
  await getAuth().deleteUsers(userIds);

  console.log('REMOVE USERS');
  await usersCollectionRef()
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });

  console.log('REMOVE GROUPS');
  await groupsCollectionRef()
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });

  console.log('REMOVE AGGREGATIONS');
  await aggregationCollectionRef()
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });

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
const createUserData = async (): Promise<string[]> => {
  const userIds: string[] = [];

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
  await userCreate(user.uid);

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

  // save user
  userIds.push(user.uid);

  // return data
  return userIds;
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
