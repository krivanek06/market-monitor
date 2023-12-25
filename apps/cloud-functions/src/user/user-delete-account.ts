import { getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { userDocumentRef, userDocumentTransactionHistoryRef, userDocumentWatchListRef } from '../models';

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
  if (!userDoc.exists) {
    throw new HttpsError('failed-precondition', 'User does not exist');
  }

  // check if authenticated user is owner
  if (userAuthId !== userResetId && !userData?.features.isAdmin) {
    throw new HttpsError('aborted', 'User is not owner');
  }

  // delete user
  await userDocumentTransactionHistoryRef(userResetId).delete();
  await userDocumentWatchListRef(userResetId).delete();
  await userDoc.ref.delete();

  // delete from auth
  await getAuth().deleteUser(userResetId);
});
