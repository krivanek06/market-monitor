import { faker } from '@faker-js/faker';
import {
  USER_DEFAULT_STARTING_CASH,
  UserAccountBasicTypes,
  UserAccountEnum,
  UserData,
  UserPersonalInfo,
} from '@mm/api-types';
import {
  createEmptyPortfolioState,
  createNameInitials,
  getCurrentDateDefaultFormat,
  getYesterdaysDate,
} from '@mm/shared/general-util';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  userDocumentPortfolioGrowthRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
  userDocumentWatchListRef,
} from '../models';

export type CreateUserAdditionalData = {
  isDemo?: boolean;
  isTest?: boolean;
  userAccountType?: UserAccountBasicTypes;
  publicIP?: string;
};

export const userCreateAccount = async (userAuthId?: string) => {
  if (!userAuthId) {
    throw new HttpsError('aborted', 'User is not authenticated');
  }

  // check if user already exists
  const existingUser = await userDocumentRef(userAuthId).get();
  if (existingUser.data()) {
    throw new HttpsError('aborted', 'User already exists');
  }

  // create new user
  const user = await getAuth().getUser(userAuthId);
  return userCreate(user);
};

export const userCreate = async (user: UserRecord, additional: CreateUserAdditionalData = {}): Promise<UserData> => {
  // create new user data
  const userName = user.displayName ?? user.email?.split('@')[0] ?? `User_${user.uid}`;
  const newUserData = createNewUser(
    user.uid,
    {
      displayName: userName,
      displayNameLowercase: userName.toLowerCase(),
      displayNameInitials: createNameInitials(userName),
      photoURL: user.photoURL ?? faker.image.avatarGitHub(),
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

  // create portfolio growth
  await userDocumentPortfolioGrowthRef(newUserData.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
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
    dates: {
      portfolioGrowthDate: getYesterdaysDate(),
    },
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
      groupRequested: [],
    },
    settings: {
      isDarkMode: true,
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
    isTest: !!additional.isTest,
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
