import { faker } from '@faker-js/faker';
import { getStockHistoricalPricesOnDate } from '@mm/api-external';
import {
  GroupCreateInput,
  GroupData,
  GroupPortfolioStateSnapshotsData,
  HistoricalPrice,
  PortfolioState,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  USER_DEMO_ACCOUNT_PASSWORD,
  UserAccountBasicTypes,
  UserAccountEnum,
  UserData,
  UserPortfolioTransaction,
} from '@mm/api-types';
import {
  dateFormatDate,
  formatToLastLastWorkingDate,
  getCurrentDateDefaultFormat,
  getRandomNumber,
  roundNDigits,
  waitSeconds,
} from '@mm/shared/general-util';
import { addDays, format, subDays } from 'date-fns';
import { firestore } from 'firebase-admin';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import { groupCreate, groupMemberAccept } from '../group';
import {
  groupDocumentPortfolioStateSnapshotsRef,
  groupsCollectionDemoAccountRef,
  userCollectionDemoAccountRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
  userDocumentWatchListRef,
} from '../models';
import { userCreate } from '../user';
import { calculateGroupMembersPortfolioState, groupCopyMembersAndTransactions } from './group-update-data';

/**
 * removes existing demo accounts (trading or normal basic) and creates a new demo trading account
 * for trading account, create one group under which demo trading accounts will live
 *
 * create 20 demo accounts and 10 basic accounts
 */
export const resetDemoAccounts = async (): Promise<void> => {
  console.log('Loading existing accounts');
  // load existing user & group demo accounts to delete
  const existingUserDemoAccounts = await userCollectionDemoAccountRef().get();
  const existingGroupDemoAccounts = await groupsCollectionDemoAccountRef().get();

  console.log(`Deleting USER demo accounts: ${existingUserDemoAccounts.docs.length}`);
  console.log(`Deleting GROUP demo accounts: ${existingGroupDemoAccounts.docs.length}`);

  // delete existing demo accounts and sub-collections - users
  for (const doc of existingUserDemoAccounts.docs) {
    const docRef = firestore().doc(`users/${doc.id}`);
    await firestore().recursiveDelete(docRef);
  }

  // delete existing demo accounts and sub-collections - groups
  for (const doc of existingGroupDemoAccounts.docs) {
    const docRef = firestore().doc(`groups/${doc.id}`);
    await firestore().recursiveDelete(docRef);
  }

  console.log('Existing demo accounts deleted');
  console.log('Creating new demo accounts');

  // create trading and normal demo accounts
  const userTradingAccounts = await createRandomUserAccounts({
    limit: 20,
    userAccountType: UserAccountEnum.DEMO_TRADING,
    isDemo: true,
  });

  console.log('Trading accounts created');

  const userNormalAccounts = await createRandomUserAccounts({
    limit: 10,
    userAccountType: UserAccountEnum.NORMAL_BASIC,
    isDemo: true,
  });

  console.log('Normal accounts created');

  // create a groups and put demo trading accounts under it
  console.log('Creating group');
  const groupRandomOwner = userTradingAccounts[0];
  const { createdGroup, groupMembers } = await createRandomGroup(groupRandomOwner, userTradingAccounts);
  console.log('Group created');

  console.log('Group creating portfolio snapshots');
  await createGroupRandomPortfolioSnapshots(createdGroup, groupMembers);
  console.log('Group created portfolio snapshots');

  // updated current holdings, copy member transaction
  console.log('Updating group data');
  await groupCopyMembersAndTransactions(createdGroup);
};

export const createRandomUserAccounts = async (data: {
  userAccountType: UserAccountBasicTypes;
  limit: number;
  isDemo?: boolean;
  password?: string;
}): Promise<UserData[]> => {
  const createdUsers: UserData[] = [];
  const limitUsers = data.limit ?? 20;

  // create demo accounts
  for (let i = 0; i < limitUsers; i++) {
    const newDemoUser = await createRandomUser(data.isDemo, data.password);
    console.log(`User created: [${i + 1}/${limitUsers}]: ${newDemoUser.displayName} - ${data.userAccountType}`);

    // create user document
    const userData = await userCreate(newDemoUser, {
      isDemo: !!data.isDemo,
      userAccountType: data.userAccountType,
    });
    // save trading accounts
    createdUsers.push(userData);

    // create watchList
    await createWatchListWithRandomSymbols(userData);

    // generate transactions
    await generateTransactionsForRandomSymbols(userData);

    // wait 0.2s sec
    await waitSeconds(0.2);

    // log
    console.log(
      `User created: [${i + 1}/${limitUsers}]: ${userData.personal.displayName} - ${userData.userAccountType}`,
    );
    console.log('-----------------------------------');
  }

  return createdUsers;
};

export const createGroupRandomPortfolioSnapshots = async (
  createdGroup: GroupData,
  groupMembers: UserData[],
): Promise<PortfolioState[]> => {
  // portfolio snapshot of the group today
  const groupCurrentPortfolioSnapshot = calculateGroupMembersPortfolioState(groupMembers, createdGroup.portfolioState);
  // generate previous snapshots by changing the current snapshot for the past 60 days
  const groupPastPortfolioSnapshots = createRandomPortfolioSnapshotsFromCurrentOne(groupCurrentPortfolioSnapshot);
  // save portfolio state
  await groupDocumentPortfolioStateSnapshotsRef(createdGroup.id).update({
    data: groupPastPortfolioSnapshots,
  } satisfies Partial<GroupPortfolioStateSnapshotsData>);

  return groupPastPortfolioSnapshots;
};

export const createRandomGroup = async (
  owner: UserData,
  users: UserData[],
): Promise<{ createdGroup: GroupData; groupMembers: UserData[] }> => {
  // select users except owner to invite
  const addedUsersToGroup = users
    .filter((u) => u.id !== owner.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 30);
  const randomUsersNotOwnerToInvite = addedUsersToGroup.map((u) => u.id);

  const groupInput: GroupCreateInput = {
    groupName: 'demo_group',
    imageUrl: faker.image.url(),
    isOwnerMember: true,
    isPublic: true,
    memberInvitedUserIds: randomUsersNotOwnerToInvite,
  };

  // create groups
  const groupData = await groupCreate(groupInput, owner.id, true);

  // log
  console.log(`Group created: ${groupData.id} - ${groupData.name}`);

  // select random 15 users to be members of the group
  const randomUsersNotOwnerAndMembers = randomUsersNotOwnerToInvite.sort(() => 0.5 - Math.random()).slice(0, 20);
  for await (const userId of randomUsersNotOwnerAndMembers) {
    // add user to group
    await groupMemberAccept(userId, groupData.id);
    // wait 0.1s sec
    await waitSeconds(0.1);
  }

  console.log('Group members added');

  return { createdGroup: groupData, groupMembers: addedUsersToGroup };
};

/**
 * from the provided portfolio state create random portfolio snapshots for the past N days.
 * mostly used when creating demo data for groups
 */
const createRandomPortfolioSnapshotsFromCurrentOne = (portfolioState: PortfolioState): PortfolioState[] => {
  const portfolioInPast: PortfolioState[] = [];
  for (let i = 60; i > 1; i--) {
    const dayBefore = subDays(new Date(), i);
    const modifyingNumber = getRandomNumber(-1000, 1000);
    // create modified portfolio state
    const modifiedPortfolioState = {
      ...portfolioState,
      date: format(dayBefore, 'yyyy-MM-dd'),
      balance: portfolioState.balance + modifyingNumber,
      invested: portfolioState.invested + modifyingNumber,
      // change cash in reverse of invested
      cashOnHand: portfolioState.cashOnHand - modifyingNumber,
    } satisfies PortfolioState;
    // save portfolio snapshot
    portfolioInPast.push(modifiedPortfolioState);
  }

  return portfolioInPast;
};

/**
 *
 * creates one buy and one sell transaction for each symbol
 * @param userData
 */
const generateTransactionsForRandomSymbols = async (userData: UserData): Promise<void> => {
  const randomSymbols = getRandomSymbols(10);

  const userDocRef = userDocumentRef(userData.id);
  const userDocTransactionsRef = userDocumentTransactionHistoryRef(userData.id);

  const userDocData = (await userDocRef.get()).data();
  const userTransactions = (await userDocTransactionsRef.get()).data()?.transactions;

  // check if user exists
  if (!userDocData || !userTransactions) {
    return;
  }

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
      const t1 = await createPortfolioCreateOperation(buyOperation, userData, userTransactions);
      const t2 = await createPortfolioCreateOperation(sellOperation, userData, userTransactions);

      transactionsToSave.push(t1);
      transactionsToSave.push(t2);
    } catch (err) {
      console.log(`Symbol: ${symbol} - no data`);
    }
  }

  // save transaction into user document
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

const createRandomUser = (isDemo?: boolean, password?: string): Promise<UserRecord> => {
  const passwordToUse = password ?? USER_DEMO_ACCOUNT_PASSWORD;
  const userIdToUse = isDemo ? `demo_${faker.string.uuid()}` : `user_${faker.string.uuid()}`;

  return getAuth().createUser({
    uid: userIdToUse,
    email: faker.internet.email(),
    emailVerified: true,
    password: passwordToUse,
    displayName: faker.person.fullName(),
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
