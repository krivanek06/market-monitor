import { UserAccountType, UserData } from '@market-monitor/api-types';

export const mockUser: UserData = {
  id: '1',
  groups: {
    groupInvitations: [],
    groupMember: [],
    groupOwner: [],
    groupWatched: [],
  },
  favoriteSymbols: [
    {
      symbol: 'AAPL',
      symbolType: 'STOCK',
    },
    {
      symbol: 'TSLA',
      symbolType: 'STOCK',
    },
    {
      symbol: 'MSFT',
      symbolType: 'STOCK',
    },
  ],
  lastSearchedSymbols: [
    {
      symbol: 'CLOV',
      symbolType: 'STOCK',
    },
    {
      symbol: 'AMC',
      symbolType: 'STOCK',
    },
  ],
  settings: {
    isCreatingGroupAllowed: true,
    isPortfolioCashActive: true,
    isProfilePublic: true,
  },
  personal: {
    accountCreated: '2021-07-01T00:00:00.000Z',
    accountType: UserAccountType.ACCOUNT_TYPE_1,
    authentication: {
      authenticationType: 'GOOGLE',
      token: '123',
    },
    displayName: 'John Doe',
    email: 'test@gmail.com',
    isVerified: true,
    lastSignIn: '2021-07-01T00:00:00.000Z',
    photoURL: null,
  },
  portfolio: {
    numberOfExecutedBuyTransactions: 4,
    numberOfExecutedSellTransactions: 2,
    portfolioCash: 5000,
    transactionFees: 40,
  },
  holdings: [
    {
      invested: 3240.3,
      symbol: 'AAPL',
      symbolType: 'STOCK',
      units: 30,
    },
    {
      invested: 500.0,
      symbol: 'TSLA',
      symbolType: 'STOCK',
      units: 1,
    },
    {
      invested: 2000.0,
      symbol: 'MSFT',
      symbolType: 'STOCK',
      units: 10,
    },
  ],
};
