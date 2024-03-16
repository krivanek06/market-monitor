import { UserAccountEnum } from '@market-monitor/api-types';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  GROUP_USER_NOT_OWNER,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
  userDocumentWatchListRef,
} from '../models';

/**
 * This function is called when a user deletes their account.
 * - remove user from database
 * - remove user from authentication
 * - delete user's sub collections
 * - delete user's storage
 */
export const userDeleteAccountCall = onCall(async (request) => {
  const userResetId = request.data as any;
  const userAuthId = request.auth?.uid;

  const userDoc = await userDocumentRef(userResetId).get();
  const userData = userDoc.data();

  // check if user exists
  if (!userData) {
    throw new HttpsError('failed-precondition', 'User does not exist');
  }

  // check if authenticated user is owner or admin
  if (userAuthId !== userResetId && userData.userAccountType !== UserAccountEnum.ADMIN) {
    throw new HttpsError('aborted', GROUP_USER_NOT_OWNER);
  }

  // delete user
  await userDocumentTransactionHistoryRef(userResetId).delete();
  await userDocumentWatchListRef(userResetId).delete();
  await userDoc.ref.delete();

  // delete from auth
  await getAuth().deleteUser(userResetId);
});
