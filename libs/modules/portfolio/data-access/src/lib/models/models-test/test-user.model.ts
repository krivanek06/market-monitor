import { USER_DEFAULT_STARTING_CASH, UserData } from '@market-monitor/api-types';
import { createEmptyPortfolioState, getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';

export const USER_TEST_1_ID = 'USER_TEST_1';

export const mockCreateUser = (data: Partial<UserData> = {}): UserData => {
  const defaultUser: UserData = {
    id: USER_TEST_1_ID,
    accountResets: [],
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
      groupRequested: [],
    },
    personal: {
      displayName: 'Test User',
      photoURL: null,
      providerId: 'google.com',
    },
    settings: {
      isProfilePublic: true,
      allowReceivingGroupInvitations: true,
    },
    portfolioState: {
      ...createEmptyPortfolioState(USER_DEFAULT_STARTING_CASH),
    },
    holdingSnapshot: {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    },
    lastLoginDate: getCurrentDateDefaultFormat(),
    accountCreatedDate: getCurrentDateDefaultFormat(),
    features: {},
  };

  return { ...defaultUser, ...data };
};
