import {
  USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT,
  USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DELETE,
  USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DEMO,
  UserData,
} from '@mm/api-types';
import { format, subDays } from 'date-fns';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { userCollectionDemoAccountRef, userDocumentRef } from '../models';
import { userDeleteAccountById } from './user-delete-account';

/**
 * accounts where user did not log in more than USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT days will be inactive
 */
export const userDeactivateInactiveAccounts = async () => {
  const loginDeadline = format(subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT), 'yyyy-MM-dd');

  console.log('[Users inactivate]: deadline', loginDeadline);

  // check in auth users who are inactive
  const inActiveUsers = await getInactiveUsers(loginDeadline);

  console.log('[Users inactivate]: inactive user ids', inActiveUsers.length);

  // deactivate accounts
  for (const inactiveUser of inActiveUsers) {
    await userDocumentRef(inactiveUser.uid).update({
      isAccountActive: false,
    } satisfies Partial<UserData>);
  }
};

export const userDeleteDemoAccounts = async () => {
  // query demo accounts which are to be deleted
  const demoAccountDeadline = format(subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DEMO), 'yyyy-MM-dd');
  const userDemoAccountsToDelete = await userCollectionDemoAccountRef()
    .where('accountCreatedDate', '<=', demoAccountDeadline)
    .get();

  console.log(`[Users demo delete]: ${userDemoAccountsToDelete.docs.length}`);

  // delete demo accounts
  for (const doc of userDemoAccountsToDelete.docs) {
    await userDeleteAccountById(doc.id);
  }
};

export const userDeleteNormalAccounts = async () => {
  // query normal accounts to be deleted
  const normalAccountDeadline = format(subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DELETE), 'yyyy-MM-dd');

  // check in auth users who are inactive
  const deleteUsers = await getInactiveUsers(normalAccountDeadline);
  console.log('[Users delete]: delete accounts', deleteUsers.length);

  // delete normal accounts
  for (const deleteUser of deleteUsers) {
    await getAuth().deleteUser(deleteUser.uid);
    console.log(`[Users delete]: ${deleteUser.displayName}, ${deleteUser.uid}`);
  }
};

/**
 *
 * @return inactive users
 */
const getInactiveUsers = async (
  loginDeadline: string,
  users: UserRecord[] = [],
  nextPageToken?: string,
): Promise<UserRecord[]> => {
  const result = await getAuth().listUsers(1000, nextPageToken);
  // Find users that have not signed in in the last N days or does not have record of last sign in.
  const inactiveUsers = result.users.filter(
    (user) =>
      (!user.metadata.lastRefreshTime && !user.metadata.lastSignInTime) ||
      format(user.metadata.lastRefreshTime || user.metadata.lastSignInTime, 'yyyy-MM-dd') <= loginDeadline,
  );

  // Add to the list of previously found inactive users.
  users = users.concat(inactiveUsers);

  // If there are more users to fetch we fetch them.
  if (result.pageToken) {
    return getInactiveUsers(loginDeadline, users, result.pageToken);
  }

  return users;
};
