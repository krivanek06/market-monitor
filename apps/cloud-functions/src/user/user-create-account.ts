import { UserAccountEnum, UserData, UserPersonalInfo, UserPortfolioTransaction, UserWatchList } from '@mm/api-types';
import { createEmptyPortfolioState, createNameInitials, getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { userDocumentTransactionHistoryRef, userDocumentWatchListRef, usersCollectionRef } from '../models';

export const userCreateAccountCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid;

  if (!userAuthId) {
    throw new HttpsError('aborted', 'User is not authenticated');
  }

  return userCreate(userAuthId);
});

export const userCreate = async (userId: string): Promise<UserData> => {
  const user = await getAuth().getUser(userId);

  // check if user exists by email
  const matchingUsers = await usersCollectionRef().where('personal.email', '==', user.email).get();
  if (!matchingUsers.empty) {
    throw new HttpsError('already-exists', 'User with the same email already exists');
  }

  // create new user data
  const userName = user.displayName ?? user.email?.split('@')[0] ?? `User_${user.uid}`;
  const newUserData = createNewUser(user.uid, {
    displayName: userName,
    displayNameInitials: createNameInitials(userName),
    photoURL: user.photoURL ?? null,
    providerId: user.providerData[0].providerId ?? 'unknown',
    email: user.email ?? 'unknown',
  });

  const newTransactions: UserPortfolioTransaction = {
    transactions: [],
  };

  const newWatchList: UserWatchList = {
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
};

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
      isDarkMode: false,
    },
    personal: personal,
    portfolioState: {
      ...createEmptyPortfolioState(),
    },
    holdingSnapshot: {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    },
    lastLoginDate: getCurrentDateDefaultFormat(),
    isAccountActive: true,
    accountCreatedDate: getCurrentDateDefaultFormat(),
    userAccountType: UserAccountEnum.DEMO_TRADING,
    systemRank: {},
    portfolioRisk: {
      alpha: 0,
      beta: 0,
      sharpe: 0,
      volatility: 0,
      calculationDate: getCurrentDateDefaultFormat(),
    },
  };
  return newUser;
};
