import { GroupData } from '../firebase';

export const GROUP_TEST_ID_1 = 'GROUP_TEST_ID_1';
export const GROUP_TEST_ID_2 = 'GROUP_TEST_ID_1';
export const GROUP_TEST_ID_3 = 'GROUP_TEST_ID_1';

export const mockCreateGroupData = (data: Partial<GroupData> = {}): GroupData => {
  return {
    id: GROUP_TEST_ID_1,
    name: 'Test Group',
    ownerUser: {
      id: '1234',
    } as GroupData['ownerUser'],
    memberInvitedUserIds: [],
    memberRequestUserIds: [],
    createdDate: new Date().toISOString(),
    endDate: null,
    imageUrl: null,
    isClosed: false,
    isPublic: true,
    memberUserIds: [],
    modifiedSubCollectionDate: new Date().toISOString(),
    nameLowerCase: 'test group',
    numberOfMembers: 0,
    ownerUserId: '',
    portfolioState: {
      balance: 0,
      cashOnHand: 0,
      holdingsBalance: 0,
      invested: 0,
      numberOfExecutedBuyTransactions: 0,
      numberOfExecutedSellTransactions: 0,
      startingCash: 0,
      transactionFees: 0,
      date: new Date().toISOString(),
      totalGainsPercentage: 0,
      totalGainsValue: 0,
      firstTransactionDate: null,
      lastTransactionDate: null,
      previousBalanceChange: 0,
      previousBalanceChangePercentage: 0,
      transactionProfit: 0,
    },
    systemRank: {},
    ...data,
  };
};
