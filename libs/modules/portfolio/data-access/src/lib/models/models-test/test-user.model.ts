import { USER_ACCOUNT_TYPE, UserData } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';

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
      accountType: USER_ACCOUNT_TYPE.BASIC,
      displayName: 'Test User',
      photoURL: null,
    },
    settings: {
      isProfilePublic: true,
    },
    lastPortfolioState: {
      cashOnHand: 0,
      startingCash: 1000,
      holdingsBalance: 0,
      invested: 0,
      numberOfExecutedBuyTransactions: 0,
      numberOfExecutedSellTransactions: 0,
      transactionFees: 0,
      totalGainsPercentage: 0,
      totalGainsValue: 0,
      userBalance: 0,
      firstTransactionDate: null,
      lastTransactionDate: null,
    },
    lastPortfolioStateModifiedDate: getCurrentDateDefaultFormat(),
    lastLoginDate: getCurrentDateDefaultFormat(),
    accountCreatedDate: getCurrentDateDefaultFormat(),
  };

  return { ...defaultUser, ...data };
};
