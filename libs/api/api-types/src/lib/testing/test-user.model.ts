import { format } from 'date-fns';
import { USER_DEFAULT_STARTING_CASH } from '../constants';
import { UserAccountEnum, UserData } from '../firebase';

export const USER_TEST_1_ID = 'USER_TEST_1';

export const mockCreateUser = (data: Partial<UserData> = {}): UserData => {
  const defaultUser: UserData = {
    id: USER_TEST_1_ID,
    systemRank: {},
    dates: {
      portfolioGrowthDate: format(new Date(), 'yyyy-MM-dd'),
    },
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
      groupRequested: [],
    },
    personal: {
      displayName: 'Test User',
      displayNameInitials: 'TU',
      photoURL: null,
      providerId: 'google.com',
      email: 'test@test.sk',
      displayNameLowercase: 'test user',
    },
    isDemo: false,
    settings: {
      isDarkMode: false,
    },
    userPrivateInfo: {
      publicIP: null,
    },
    portfolioState: {
      balance: USER_DEFAULT_STARTING_CASH,
      cashOnHand: USER_DEFAULT_STARTING_CASH,
      holdingsBalance: 0,
      invested: 0,
      numberOfExecutedBuyTransactions: 0,
      numberOfExecutedSellTransactions: 0,
      startingCash: USER_DEFAULT_STARTING_CASH,
      transactionFees: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      totalGainsPercentage: 0,
      totalGainsValue: 0,
      firstTransactionDate: null,
      lastTransactionDate: null,
      previousBalanceChange: 0,
      previousBalanceChangePercentage: 0,
    },
    holdingSnapshot: {
      lastModifiedDate: format(new Date(), 'yyyy-MM-dd'),
      data: [],
    },
    isAccountActive: true,
    accountCreatedDate: format(new Date(), 'yyyy-MM-dd'),
    userAccountType: UserAccountEnum.NORMAL_BASIC,
  };

  return { ...defaultUser, ...data };
};
