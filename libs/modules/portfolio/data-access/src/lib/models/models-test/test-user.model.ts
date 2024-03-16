import { USER_DEFAULT_STARTING_CASH, UserAccountEnum, UserData } from '@mm/api-types';
import { createEmptyPortfolioState, getCurrentDateDefaultFormat } from '@mm/shared/general-util';

export const USER_TEST_1_ID = 'USER_TEST_1';

export const mockCreateUser = (data: Partial<UserData> = {}): UserData => {
  const defaultUser: UserData = {
    id: USER_TEST_1_ID,
    systemRank: {},
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
      email: 'test@test.sk',
    },
    settings: {
      isDarkMode: false,
    },
    portfolioState: {
      ...createEmptyPortfolioState(USER_DEFAULT_STARTING_CASH),
    },
    holdingSnapshot: {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    },
    lastLoginDate: getCurrentDateDefaultFormat(),
    isAccountActive: true,
    accountCreatedDate: getCurrentDateDefaultFormat(),
    userAccountType: UserAccountEnum.NORMAL_BASIC,
  };

  return { ...defaultUser, ...data };
};
