import { GroupMember, PortfolioState, PortfolioStateHoldings, UserBase, UserData } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat, roundNDigits } from '@market-monitor/shared/utils-general';

export const transformUserToBase = (user: UserData): UserBase => {
  return {
    id: user.id,
    accountCreatedDate: user.accountCreatedDate,
    portfolioState: user.portfolioState,
    personal: user.personal,
    lastLoginDate: user.lastLoginDate,
  };
};

export const transformUserToGroupMember = (
  user: UserData,
  newPosition: number,
  userPreviousGroupData?: GroupMember,
): GroupMember => {
  return {
    ...transformUserToBase(user),
    since: getCurrentDateDefaultFormat(),
    position: {
      currentGroupMemberPosition: newPosition,
      previousGroupMemberPosition: userPreviousGroupData?.position?.currentGroupMemberPosition ?? null,
    },
  };
};

export const transformPortfolioStateHoldingToPortfolioState = (holding: PortfolioStateHoldings): PortfolioState => {
  return {
    balance: holding.balance,
    cashOnHand: holding.cashOnHand,
    invested: holding.invested,
    numberOfExecutedBuyTransactions: holding.numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions: holding.numberOfExecutedSellTransactions,
    transactionFees: holding.transactionFees,
    holdingsBalance: holding.holdingsBalance,
    totalGainsValue: roundNDigits(holding.totalGainsValue, 2),
    totalGainsPercentage: roundNDigits(holding.totalGainsPercentage, 2),
    firstTransactionDate: holding.firstTransactionDate,
    lastTransactionDate: holding.lastTransactionDate,
    date: holding.date,
    startingCash: holding.startingCash,
  };
};
