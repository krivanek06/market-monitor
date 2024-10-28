import {
  GroupBase,
  GroupData,
  GroupMember,
  PortfolioState,
  PortfolioStateHoldings,
  UserBase,
  UserBaseMin,
  UserData,
} from '@mm/api-types';
import { getCurrentDateDefaultFormat } from './date-service.util';
import { roundNDigits } from './general-function.util';

export const transformUserToBase = (user: UserData): UserBase => {
  return {
    id: user.id,
    accountCreatedDate: user.accountCreatedDate,
    portfolioState: user.portfolioState,
    personal: user.personal,
    isAccountActive: user.isAccountActive,
    isDemo: user.isDemo,
    userAccountType: user.userAccountType,
  };
};

export const transformUserToBaseMin = (user: UserData): UserBaseMin => {
  return {
    id: user.id,
    personal: user.personal,
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
    nameLowerCase: group.nameLowerCase,
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
export const transformPortfolioStateHoldingToPortfolioState = (holding: PortfolioStateHoldings): PortfolioState => {
  return {
    balance: holding.balance,
    cashOnHand: holding.cashOnHand,
    invested: holding.invested,
    numberOfExecutedBuyTransactions: holding.numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions: holding.numberOfExecutedSellTransactions,
    transactionFees: holding.transactionFees,
    holdingsBalance: holding.holdingsBalance,
    totalGainsValue: roundNDigits(holding.totalGainsValue),
    totalGainsPercentage: roundNDigits(holding.totalGainsPercentage),
    firstTransactionDate: holding.firstTransactionDate,
    lastTransactionDate: holding.lastTransactionDate,
    date: holding.date,
    startingCash: holding.startingCash,
    previousBalanceChange: roundNDigits(holding.previousBalanceChange),
    previousBalanceChangePercentage: holding.previousBalanceChangePercentage,
  };
};
