import {
  GroupBase,
  GroupData,
  GroupMember,
  PortfolioRisk,
  PortfolioState,
  PortfolioStateHoldings,
  UserBase,
  UserData,
} from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat, roundNDigits } from '@market-monitor/shared/features/general-util';

export const transformUserToBase = (user: UserData): UserBase => {
  return {
    id: user.id,
    accountCreatedDate: user.accountCreatedDate,
    portfolioState: user.portfolioState,
    personal: user.personal,
    lastLoginDate: user.lastLoginDate,
    isAccountActive: user.isAccountActive,
  };
};

export const transformGroupToBase = (group: GroupData): GroupBase => {
  return {
    id: group.id,
    name: group.name,
    ownerUserId: group.ownerUserId,
    isClosed: group.isClosed,
    createdDate: group.createdDate,
    endDate: group.endDate,
    imageUrl: group.imageUrl,
    isPublic: group.isPublic,
    ownerUser: group.ownerUser,
    portfolioState: group.portfolioState,
    numberOfMembers: group.numberOfMembers,
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

/**
 * transform PortfolioStateHoldings to PortfolioState
 */
export const transformPortfolioStateHoldingToPortfolioState = (
  holding: PortfolioStateHoldings,
  portfolioRisk?: PortfolioRisk,
): PortfolioState => {
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
    previousBalanceChange: holding.previousBalanceChange,
    previousBalanceChangePercentage: holding.previousBalanceChangePercentage,
    accountResetDate: holding.accountResetDate,
    portfolioRisk,
  };
};
