import {
  GroupData,
  PortfolioState,
  PortfolioStateHoldingPartial,
  PortfolioTransaction,
} from '@market-monitor/api-types';
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
    .sort((a, b) => (b.date < a.date ? -1 : 1))
    .slice(0, 250);

  // calculate portfolioState from all members
  const portfolioState = membersData
    .map((d) => d.portfolioState)
    .reduce((acc, curr) => {
      if (!acc) {
        return curr;
      }

      // merge holdings by symbol
      const mergedPartialHoldings = [...acc.holdingsPartial, ...curr.holdingsPartial].reduce(
        (acc, curr) => ({
          ...acc,
          ...{
            [curr.symbol]: {
              ...curr,
              invested: (acc[curr.symbol]?.invested || 0) + curr.invested,
              units: (acc[curr.symbol]?.units || 0) + curr.units,
              symbol: curr.symbol,
              symbolType: curr.symbolType,
            },
          },
        }),
        {} as { [key: string]: PortfolioStateHoldingPartial },
      );

      console.log('mergedPartialHoldings');
      console.log(mergedPartialHoldings);

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
        holdingsPartial: getObjectEntries(mergedPartialHoldings).map((d) => d[1]),
      };

      return result;
    }, null);

  // calculate additional fields
  portfolioState.totalGainsValue = roundNDigits(portfolioState.holdingsBalance - portfolioState.invested, 2);
  portfolioState.totalGainsPercentage = roundNDigits(
    portfolioState.totalGainsValue / portfolioState.holdingsBalance,
    2,
  );

  // update last transactions for the group
  await groupDocumentTransactionsRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    lastTransactions: lastTransactions,
  });

  // update members for the group
  await groupDocumentMembersRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    memberUsers: membersData.map((d) => transformUserToGroupMember(d)),
  });

  // update owner for group
  await groupDocumentRef(group.id).update({
    ownerUser: transformUserToBase(ownerData),
    modifiedSubCollectionDate: getCurrentDateDefaultFormat(),
    portfolioState: portfolioState,
  });

  // save portfolio state
  await groupDocumentPortfolioStateSnapshotsRef(group.id).update({
    data: FieldValue.arrayUnion(portfolioState),
  });
};
