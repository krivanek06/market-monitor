import { USER_ROLE, UserAccountType, UserData } from '@market-monitor/api-types';

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
    },
    personal: {
      accountType: UserAccountType.TEST,
      displayName: 'Test User',
      photoURL: null,
    },
    role: USER_ROLE.BASIC,
    settings: {
      isProfilePublic: true,
    },
  };

  return { ...defaultUser, ...data };
};
