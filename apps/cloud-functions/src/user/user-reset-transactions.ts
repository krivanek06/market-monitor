import { UserAccountTypes, UserFeatures, UserResetTransactionsInput } from '@market-monitor/api-types';
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

  const userDoc = await userDocumentRef(data.userId).get();
  const userData = userDoc.data();

  // check if owner match request user id
  if (data.userId !== userAuthId) {
    throw new HttpsError('failed-precondition', 'User is not owner');
  }

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', 'User does not exist');
  }

  const startingCash = data.accountTypeSelected === UserAccountTypes.Trading ? userDefaultStartingCash : 0;
  const newUserData = {
    ...userData,
    portfolioState: {
      ...createUserPortfolioStateEmpty(startingCash),
    },
    features: {
      ...getUserFeaturesByAccountType(data.accountTypeSelected),
    },
  };

  // reset user portfolio state
  await userDocumentRef(data.userId).update({
    ...newUserData,
  });

  // delete transactions
  await userDocumentTransactionHistoryRef(data.userId).update({
    transactions: [],
  });
});

const getUserFeaturesByAccountType = (accountType: UserAccountTypes): UserFeatures => {
  switch (accountType) {
    case UserAccountTypes.Basic:
      return {
        allowPortfolioCashAccount: false,
        allowAccessGroups: false,
      };
    case UserAccountTypes.Trading:
      return {
        allowPortfolioCashAccount: true,
        allowAccessGroups: true,
        allowAccessHallOfFame: true,
      };
    default:
      throw new HttpsError('invalid-argument', 'Invalid account type');
  }
};
