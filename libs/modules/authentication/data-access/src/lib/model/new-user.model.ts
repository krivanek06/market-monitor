import { UserData, UserPersonalInfo } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
export const createNewUser = (id: string, personal: UserPersonalInfo): UserData => {
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
      isProfilePublic: true,
    },
    personal: personal,
    accountResets: [],
    lastPortfolioState: {
      cashOnHand: 0,
      startingCash: 0,
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
  return newUser;
};
