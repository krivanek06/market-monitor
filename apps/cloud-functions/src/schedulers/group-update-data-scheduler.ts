import { GroupData, PortfolioState, PortfolioStateHoldingBase, PortfolioTransaction } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat, getObjectEntries, roundNDigits } from '@market-monitor/shared/utils-general';
import { FieldValue } from 'firebase-admin/firestore';
import {
  groupDocumentMembersRef,
  groupDocumentPortfolioStateSnapshotsRef,
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
export const groupUpdateDataScheduler = async (): Promise<void> => {
  const today = getCurrentDateDefaultFormat();
  // get all non closed groups
  const group = await groupsCollectionRef()
    .where('modifiedSubCollectionDate', '!=', today)
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

  /**
   * difference is membersPreviousData can contain less people, those who accepted membership only today
   */
  const membersPreviousData = (await groupDocumentMembersRef(group.id).get()).data();
  const membersCurrentData = (
    await usersCollectionRef().where('groups.groupMember', 'array-contains', group.id).get()
  ).docs.map((d) => d.data());

  // load all transactions of the group members
  const memberTransactionHistory = await Promise.all(
    membersCurrentData.map((m) => userDocumentTransactionHistoryRef(m.id).get()),
  );

  // save only last N transactions for everybody - order by date desc
  const lastTransactions = memberTransactionHistory
    .map((d) => d.data())
    .reduce((acc, val) => [...acc, ...val.transactions.slice(0, 10)], [] as PortfolioTransaction[])
    .sort((a, b) => (b.date < a.date ? -1 : 1))
    .slice(0, 250);

  // calculate holdings from all members
  const memberHoldingSnapshots = membersCurrentData
    .map((d) => d.holdingSnapshot.data)
    .reduce(
      (acc, curr) =>
        curr.reduce(
          (acc2, curr2) => ({
            ...acc2,
            [curr2.symbol]: {
              invested: (acc[curr2.symbol]?.invested || 0) + curr2.invested,
              units: (acc[curr2.symbol]?.units || 0) + curr2.units,
              symbol: curr2.symbol,
              symbolType: curr2.symbolType,
            },
          }),
          {} as { [key: string]: PortfolioStateHoldingBase },
        ),
      {} as { [key: string]: PortfolioStateHoldingBase },
    );

  // calculate portfolioState from all members
  const memberPortfolioState = membersCurrentData
    .map((d) => d.portfolioState)
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
    }, null as PortfolioState);

  // calculate additional fields
  memberPortfolioState.totalGainsValue = roundNDigits(
    memberPortfolioState.holdingsBalance - memberPortfolioState.invested,
  );
  memberPortfolioState.totalGainsPercentage = roundNDigits(
    memberPortfolioState.totalGainsValue / memberPortfolioState.holdingsBalance,
  );

  // create group members, calculate current group position
  const updatedGroupMembers = membersCurrentData
    .slice()
    .sort((a, b) => b.portfolioState.totalGainsValue - a.portfolioState.totalGainsValue)
    .map((d, index) => transformUserToGroupMember(d, index + 1, membersPreviousData?.data?.find((m) => m.id === d.id)));

  // update last transactions for the group
  await groupDocumentTransactionsRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: lastTransactions,
  });

  // update members for the group
  await groupDocumentMembersRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: updatedGroupMembers,
  });

  // update owner for group
  await groupDocumentRef(group.id).update({
    ownerUser: transformUserToBase(ownerData),
    modifiedSubCollectionDate: getCurrentDateDefaultFormat(),
    portfolioState: memberPortfolioState,
    holdingSnapshot: {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: getObjectEntries(memberHoldingSnapshots).map((d) => d[1]),
    },
  });

  // save portfolio state
  await groupDocumentPortfolioStateSnapshotsRef(group.id).update({
    data: FieldValue.arrayUnion(memberPortfolioState),
  });
};
