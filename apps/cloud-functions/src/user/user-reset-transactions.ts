import { UserAccountTypes, UserResetTransactionsInput } from '@market-monitor/api-types';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { userDocumentRef } from '../models';
import {
  createUserPortfolioStateEmpty,
  userDefaultStartingCash,
  userDocumentTransactionHistoryRef,
} from './../models/user';

/**
 * Reset all transactions for a user
 */
export const userResetTransactionsCall = onCall(async (request) => {
  const data = request.data as UserResetTransactionsInput;
  const userAuthId = request.auth?.uid;

  const userData = await userDocumentRef(data.userId).get();

  // check if owner match request user id
  if (data.userId !== userAuthId) {
    throw new HttpsError('failed-precondition', 'User is not owner');
  }

  // check if user exists
  if (!userData.exists) {
    throw new HttpsError('not-found', 'User does not exist');
  }

  const isTradingAccount = data.accountTypeSelected === UserAccountTypes.Trading;

  // reset user portfolio state
  await userDocumentRef(data.userId).update({
    portfolioState: {
      ...createUserPortfolioStateEmpty(isTradingAccount ? userDefaultStartingCash : 0),
    },
    'features.userPortfolioAllowCashAccount': isTradingAccount,
    'features.groupAllowAccess': isTradingAccount,
  });

  // delete transactions
  await userDocumentTransactionHistoryRef(data.userId).update({
    transactions: [],
  });
});
