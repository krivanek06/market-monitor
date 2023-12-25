import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { userDocumentRef } from '../models';
import { userDocumentTransactionHistoryRef, userPortfolioStateEmpty } from './../models/user';

/**
 * Reset all transactions for a user
 */
export const userResetTransactionsCall = onCall(async (request) => {
  const userResetId = request.data as string;
  const userAuthId = request.auth?.uid;

  const userData = await userDocumentRef(userResetId).get();

  // check if owner match request user id
  if (userResetId !== userAuthId) {
    throw new HttpsError('failed-precondition', 'User is not owner');
  }

  // check if user exists
  if (!userData.exists) {
    throw new HttpsError('not-found', 'User does not exist');
  }

  // reset user portfolio state
  await userDocumentRef(userResetId).update({
    portfolioState: {
      ...userPortfolioStateEmpty,
    },
  });

  // delete transactions
  await userDocumentTransactionHistoryRef(userResetId).update({
    transactions: [],
  });
});
