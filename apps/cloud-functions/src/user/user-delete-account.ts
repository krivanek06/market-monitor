import { firestore } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import { userDocumentRef } from '../database';

/**
 * This function is called when a user deletes their account.
 * - remove user from database
 * - remove user from authentication
 * - delete user's sub collections
 * - delete user's storage
 */
export const userDeleteAccount = async (userAuthId?: string) => {
  if (!userAuthId) {
    throw new HttpsError('unauthenticated', 'User not authenticated');
  }

  try {
    const userDoc = await userDocumentRef(userAuthId).get();
    const userData = userDoc.data();

    // check if user exists
    if (!userData) {
      throw new HttpsError('failed-precondition', 'User does not exist');
    }

    // delete user's sub collections
    await firestore().recursiveDelete(userDoc.ref);

    // delete from auth
    await getAuth().deleteUser(userAuthId);
  } catch (error) {
    throw new HttpsError('internal', 'Unable to delete account, please contact support');
  }
};
