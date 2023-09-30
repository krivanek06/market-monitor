import { User, UserAccountType } from '@market-monitor/api-types';

export const USER_TEST_1_ID = 'USER_TEST_1';

export const mockCreateUser = (data: Partial<User> = {}): User => {
  const defaultUser: User = {
    id: USER_TEST_1_ID,
    favoriteSymbols: [
      {
        symbolType: 'STOCK',
        symbol: 'AAPL',
      },
      {
        symbolType: 'STOCK',
        symbol: 'MSFT',
      },
    ],
    lastSearchedSymbols: [
      {
        symbolType: 'STOCK',
        symbol: 'CCL',
      },
      {
        symbolType: 'STOCK',
        symbol: 'AAL',
      },
    ],
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
    },
    personal: {
      accountCreated: '2020-01-01',
      accountType: UserAccountType.TEST,
      authentication: {
        authenticationType: 'GOOGLE',
        token: '123',
      },
      displayName: 'Test User',
      email: 'test@email.com',
      isVerified: true,
      lastSignIn: '2020-01-01',
      photoURL: null,
    },
    settings: {
      isCreatingGroupAllowed: true,
      isTransactionFeesActive: true,
      isPortfolioCashActive: true,
      isProfilePublic: true,
    },
  };

  return { ...defaultUser, ...data };
};
