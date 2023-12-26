import { UserAccountTypes, UserData, UserResetTransactionsInput } from '@market-monitor/api-types';
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

  const newUserData = createUserDataByType(data.accountTypeSelected, userData);

  // reset user portfolio state
  await userDocumentRef(data.userId).update({
    ...newUserData,
  });

  // delete transactions
  await userDocumentTransactionHistoryRef(data.userId).update({
    transactions: [],
  });
});

const createUserDataByType = (accountType: UserAccountTypes, currentUser: UserData) => {
  // trading account
  if (accountType === UserAccountTypes.Trading) {
    const userData: Partial<UserData> = {
      ...currentUser,
      portfolioState: {
        ...createUserPortfolioStateEmpty(userDefaultStartingCash),
      },
      features: {
        ...currentUser.features,
        userPortfolioAllowCashAccount: true,
        groupAllowAccess: true,
      },
    };

    return userData;
  }

  // basic account
  if (accountType === UserAccountTypes.Basic) {
    const userData: Partial<UserData> = {
      ...currentUser,
      portfolioState: {
        ...createUserPortfolioStateEmpty(0),
      },
      features: {
        ...currentUser.features,
        userPortfolioAllowCashAccount: false,
        groupAllowAccess: false,
      },
    };

    return userData;
  }

  throw new HttpsError('invalid-argument', 'Invalid account type');
};
