import { getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDeleteData } from '../group/group-delete';
import { userDocumentRef, userDocumentTransactionHistoryRef, userDocumentWatchListRef } from '../models';

/**
 * This function is called when a user deletes their account.
 * - remove user from database
 * - remove user from authentication
 * - delete user's sub collections
 * - delete user's storage
 */
export const userDeleteAccountCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid;

  if (!userAuthId) {
    throw new HttpsError('unauthenticated', 'User not authenticated');
  }

  try {
    await userDeleteAccountById(userAuthId);
  } catch (error) {
    throw new HttpsError('internal', 'Unable to delete account, please contact support');
  }
});

export const userDeleteAccountById = async (userId: string): Promise<void> => {
  const userDoc = await userDocumentRef(userId).get();
  const userData = userDoc.data();

  // check if user exists
  if (!userData) {
    throw new HttpsError('failed-precondition', 'User does not exist');
  }

  // delete user
  await userDocumentTransactionHistoryRef(userId).delete();
  await userDocumentWatchListRef(userId).delete();
  await userDoc.ref.delete();

  // delete groups where user is the owner
  for (const groupId of userData.groups.groupOwner) {
    await groupDeleteData(userId, groupId);
  }

  // delete from auth
  await getAuth().deleteUser(userId);
};
