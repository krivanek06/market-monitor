import { UserData, UserPersonalInfo, UserPortfolioTransaction, UserWatchlist } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { userDocumentTransactionHistoryRef, userDocumentWatchListRef, usersCollectionRef } from '../models';

export const userCreateAccountCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid;

  if (!userAuthId) {
    throw new HttpsError('aborted', 'User is not authenticated');
  }

  const user = await getAuth().getUser(userAuthId);

  // check if user exists by email
  const matchingUsers = await usersCollectionRef().where('personal.email', '==', user.email).get();
  if (!matchingUsers.empty) {
    throw new HttpsError('already-exists', 'User with the same email already exists');
  }

  // create new user data
  const newUserData = createNewUser(user.uid, {
    displayName: user.displayName ?? user.email?.split('@')[0] ?? `User_${user.uid}`,
    photoURL: user.photoURL ?? null,
    providerId: user.providerData[0].providerId ?? 'unknown',
  });

  const newTransactions: UserPortfolioTransaction = {
    transactions: [],
  };

  const newWatchList: UserWatchlist = {
    createdDate: getCurrentDateDefaultFormat(),
    data: [],
  };

  // update user
  await usersCollectionRef().doc(newUserData.id).set(newUserData);
  // update transactions
  await userDocumentTransactionHistoryRef(newUserData.id).set(newTransactions);
  // update watchList
  await userDocumentWatchListRef(newUserData.id).set(newWatchList);

  // return data
  return newUserData;
});

const createNewUser = (id: string, personal: UserPersonalInfo): UserData => {
  const newUser: UserData = {
    id,
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
      groupRequested: [],
    },
    settings: {
      isProfilePublic: true,
      allowReceivingGroupInvitations: true,
    },
    personal: personal,
    accountResets: [],
    portfolioState: {
      cashOnHand: 0,
      startingCash: 0,
      holdingsBalance: 0,
      invested: 0,
      numberOfExecutedBuyTransactions: 0,
      numberOfExecutedSellTransactions: 0,
      transactionFees: 0,
      totalGainsPercentage: 0,
      totalGainsValue: 0,
      balance: 0,
      firstTransactionDate: null,
      lastTransactionDate: null,
      date: getCurrentDateDefaultFormat(),
      previousBalanceChange: 0,
      previousBalanceChangePercentage: 0,
    },
    holdingSnapshot: {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    },
    lastLoginDate: getCurrentDateDefaultFormat(),
    accountCreatedDate: getCurrentDateDefaultFormat(),
    features: {},
  };
  return newUser;
};
