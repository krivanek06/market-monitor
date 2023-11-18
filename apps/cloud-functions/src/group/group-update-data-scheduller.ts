import { GroupData, PortfolioState, PortfolioTransaction } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
import {
  groupDocumentMembersRef,
  groupDocumentRef,
  groupDocumentTransactionsRef,
  groupsCollectionRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
  usersCollectionRef,
} from '../models';
import { transformUserToBase, transformUserToGroupMember } from '../utils';

/**
 * for each group update:
 * - members
 * - transactions
 * - owner
 */
export const updateGroupData = async (): Promise<void> => {
  const today = getCurrentDateDefaultFormat();
  // get all non closed groups
  const group = await groupsCollectionRef()
    .where('lastModifiedSubCollectionDate', '!=', today)
    .where('isClosed', '==', false)
    .limit(25)
    .get();

  console.log(`Loaded ${group.docs.length} groups`);

  for await (const groupDoc of group.docs) {
    const groupData = groupDoc.data();
    console.log(`Updating group ${groupData.id}, name: ${groupData.name}`);
    try {
      await copyMembersAndTransactions(groupData);
    } catch (e) {
      console.error(`Error updating group ${groupData.id}, name: ${groupData.name}`, e);
    }
  }

  console.log('Done');
};

const copyMembersAndTransactions = async (group: GroupData): Promise<void> => {
  // load all members of the group
  const ownerData = (await userDocumentRef(group.ownerUserId).get()).data();
  const membersData = (
    await usersCollectionRef().where('groups.groupMember', 'array-contains', group.id).get()
  ).docs.map((d) => d.data());

  // load all transactions of the group members
  const memberTransactionHistory = await Promise.all(
    membersData.map((m) => userDocumentTransactionHistoryRef(m.id).get()),
  );

  // save only last N transactions for everybody - order by date desc
  const lastTransactions = memberTransactionHistory
    .map((d) => d.data())
    .reduce((acc, val) => [...acc, ...val.transactions.slice(0, 10)], [] as PortfolioTransaction[])
    .sort((a, b) => (b.date < a.date ? 1 : -1));

  // calculate lastPortfolioState from all members
  const lastPortfolioState = membersData
    .map((d) => d.lastPortfolioState)
    .reduce((acc, curr) => {
      if (!acc) {
        return curr;
      }

      const result: PortfolioState = {
        balance: acc.balance + curr.balance,
        cashOnHand: acc.cashOnHand + curr.cashOnHand,
        holdingsBalance: acc.holdingsBalance + curr.holdingsBalance,
        invested: acc.invested + curr.invested,
        numberOfExecutedBuyTransactions: acc.numberOfExecutedBuyTransactions + curr.numberOfExecutedBuyTransactions,
        numberOfExecutedSellTransactions: acc.numberOfExecutedSellTransactions + curr.numberOfExecutedSellTransactions,
        startingCash: acc.startingCash + curr.startingCash,
        transactionFees: acc.transactionFees + curr.transactionFees,
        modifiedDate: getCurrentDateDefaultFormat(),
        totalGainsPercentage: 0,
        totalGainsValue: 0,
        firstTransactionDate: null,
        lastTransactionDate: null,
      };

      return result;
    }, null);

  // calculate additional fields
  lastPortfolioState.totalGainsValue = lastPortfolioState.holdingsBalance - lastPortfolioState.invested;
  lastPortfolioState.totalGainsPercentage = lastPortfolioState.totalGainsValue / lastPortfolioState.holdingsBalance;

  // update last transactions for the group
  groupDocumentTransactionsRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    lastTransactions: lastTransactions,
  });

  // update members for the group
  groupDocumentMembersRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    memberUsers: membersData.map((d) => transformUserToGroupMember(d)),
  });

  // update owner
  groupDocumentRef(group.id).update({
    ownerUser: transformUserToBase(ownerData),
    lastModifiedSubCollectionDate: getCurrentDateDefaultFormat(),
    lastPortfolioState: lastPortfolioState,
  });
};
