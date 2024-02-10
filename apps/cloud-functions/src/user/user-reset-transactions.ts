import {
  USER_DEFAULT_STARTING_CASH,
  UserAccountTypes,
  UserData,
  UserFeatures,
  UserResetTransactionsInput,
} from '@market-monitor/api-types';
import { createEmptyPortfolioState } from '@market-monitor/shared/features/general-util';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { GROUP_USER_NOT_OWNER, userDocumentRef } from '../models';
import { userDocumentTransactionHistoryRef } from './../models/user';

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
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', 'User does not exist');
  }

  resetTransactionsForUser(userData, data.accountTypeSelected);
});

export const resetTransactionsForUser = async (userData: UserData, accountType: UserAccountTypes): Promise<void> => {
  const startingCash = accountType === UserAccountTypes.Trading ? USER_DEFAULT_STARTING_CASH : 0;
  const newUserData = {
    ...userData,
    portfolioState: {
      ...createEmptyPortfolioState(startingCash),
    },
    features: {
      ...getUserFeaturesByAccountType(accountType),
    },
  } satisfies UserData;

  // reset user portfolio state
  await userDocumentRef(userData.id).update({
    ...newUserData,
  });

  // delete transactions
  await userDocumentTransactionHistoryRef(userData.id).update({
    transactions: [],
  });
};

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
