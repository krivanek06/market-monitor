import { UserAccountEnum } from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import {
  createGroupRandomPortfolioSnapshots,
  createRandomGroup,
  createRandomUserAccounts,
} from '../schedulers/accounts-demo-reset';
import { groupCopyMembersAndTransactions } from '../schedulers/group-update-data';
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

  // create users
  console.log('CREATE NEW USERS - START');
  const newUsers = await createRandomUserAccounts({
    limit: 50,
    isDemo: false,
    userAccountType: UserAccountEnum.DEMO_TRADING,
    password: 'qwer1234',
  });

  console.log('CREATE NEW USERS - DONE');

  // create group data
  console.log('CREATE NEW GROUPS - START');
  // get 10 random users
  const owners = newUsers
    .filter((d) => d.userAccountType === UserAccountEnum.DEMO_TRADING)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  // generate groups
  for (const owner of owners) {
    console.log('Group created');
    const { createdGroup, groupMembers } = await createRandomGroup(owner, newUsers);
    console.log('Updating group data');
    await createGroupRandomPortfolioSnapshots(createdGroup, groupMembers);
    console.log('Updating group data');
    await groupCopyMembersAndTransactions(createdGroup);
  }
  console.log('CREATE NEW GROUPS - DONE');

  const endTime = performance.now();
  const secondsDiff = Math.round((endTime - startTime) / 1000);
  console.log(`Function took: ~${secondsDiff} seconds`);
};

/**
 * function to clear whole DB
 */
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
