import {
  USER_DEFAULT_STARTING_CASH,
  UserAccountBasicTypes,
  UserAccountEnum,
  UserData,
  UserPersonalInfo,
} from '@mm/api-types';
import { createEmptyPortfolioState, createNameInitials, getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { userDocumentRef, userDocumentTransactionHistoryRef, userDocumentWatchListRef } from '../models';

export type CreateUserAdditionalData = {
  isDemo?: boolean;
  userAccountType?: UserAccountBasicTypes;
  publicIP?: string;
};

export const userCreateAccountCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid;

  if (!userAuthId) {
    throw new HttpsError('aborted', 'User is not authenticated');
  }

  const user = await getAuth().getUser(userAuthId);
  return userCreate(user);
});

export const userCreate = async (user: UserRecord, additional: CreateUserAdditionalData = {}): Promise<UserData> => {
  // create new user data
  const userName = user.displayName ?? user.email?.split('@')[0] ?? `User_${user.uid}`;
  const userNamePrefix = additional.isDemo ? `Demo_${userName}` : userName;
  const newUserData = createNewUser(
    user.uid,
    {
      displayName: userNamePrefix,
      displayNameLowercase: userNamePrefix.toLowerCase(),
      displayNameInitials: createNameInitials(userNamePrefix),
      photoURL: user.photoURL ?? null,
      providerId: user.providerData[0].providerId ?? 'unknown',
      email: user.email ?? 'unknown',
    },
    additional,
  );

  // update user
  await userDocumentRef(newUserData.id).set(newUserData);

  // update transactions
  await userDocumentTransactionHistoryRef(newUserData.id).set({
    transactions: [],
  });

  // update watchList
  await userDocumentWatchListRef(newUserData.id).set({
    createdDate: getCurrentDateDefaultFormat(),
    data: [],
  });

  // return data
  return newUserData;
};

const createNewUser = (id: string, personal: UserPersonalInfo, additional: CreateUserAdditionalData = {}): UserData => {
  // set starting cash to 0 for normal basic users
  const startingCash =
    !!additional.userAccountType && additional.userAccountType === UserAccountEnum.NORMAL_BASIC
      ? 0
      : USER_DEFAULT_STARTING_CASH;

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
      ...createEmptyPortfolioState(startingCash),
    },
    holdingSnapshot: {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    },
    isAccountActive: true,
    isDemo: !!additional.isDemo,
    accountCreatedDate: getCurrentDateDefaultFormat(),
    userAccountType: additional?.userAccountType ?? UserAccountEnum.DEMO_TRADING,
    systemRank: {},
    userPrivateInfo: {
      publicIP: additional.publicIP ?? null,
    },
    portfolioRisk: {
      alpha: 0,
      beta: 0,
      sharpe: 0,
      volatility: 0,
      date: getCurrentDateDefaultFormat(),
    },
  };
  return { ...newUser, ...additional };
};
