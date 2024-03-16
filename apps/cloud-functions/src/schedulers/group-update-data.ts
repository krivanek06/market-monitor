import {
  GroupData,
  GroupHoldingSnapshotsData,
  GroupMembersData,
  GroupTransactionsData,
  PortfolioStateHoldingBase,
  PortfolioTransaction,
  UserData,
} from '@mm/api-types';
import {
  calculateGrowth,
  createEmptyPortfolioState,
  getCurrentDateDefaultFormat,
  getObjectEntries,
  roundNDigits,
} from '@mm/shared/general-util';
import { FieldValue } from 'firebase-admin/firestore';
import {
  groupDocumentHoldingSnapshotsRef,
  groupDocumentMembersRef,
  groupDocumentPortfolioStateSnapshotsRef,
  groupDocumentRef,
  groupDocumentTransactionsRef,
  groupsCollectionRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '../models';
import { transformUserToBase, transformUserToGroupMember } from '../utils';

/**
 * for each group update:
 * - members
 * - transactions
 * - owner
 */
export const groupUpdateData = async (): Promise<void> => {
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
  const isOwnerMember = !!group.memberUserIds.find((m) => m === group.ownerUserId);

  if (!ownerData) {
    console.error(`Owner not found for group ${group.id}`);
    return;
  }

  /**
   * difference is membersPreviousData can contain less people, those who accepted membership only today
   */
  const membersPreviousData = (await groupDocumentMembersRef(group.id).get()).data();
  const memberIds = membersPreviousData?.data.map((d) => d.id) ?? [];
  const membersCurrentData = (await Promise.all(memberIds.map((id) => userDocumentRef(id).get())))
    .map((d) => d.data())
    .filter((d): d is UserData => !!d);

  // load all transactions of the group members
  const memberTransactionHistory = await Promise.all(
    membersCurrentData.map((m) => userDocumentTransactionHistoryRef(m.id).get()),
  );

  // save only last N transactions for everybody - order by date desc
  const lastTransactions = memberTransactionHistory
    .map((d) => d.data())
    .reduce((acc, val) => [...acc, ...(val?.transactions ?? []).slice(0, 10)], [] as PortfolioTransaction[])
    .sort((a, b) => (b.date < a.date ? -1 : 1))
    .slice(0, 250);

  // calculate holdings from all members
  const memberHoldingSnapshots = membersCurrentData
    // calculate holdings from all members
    .map((d) =>
      d.holdingSnapshot.data.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.symbol]: {
            invested: roundNDigits((acc[curr.symbol]?.invested ?? 0) + curr.invested),
            units: (acc[curr.symbol]?.units ?? 0) + curr.units,
            symbol: curr.symbol,
            symbolType: curr.symbolType,
          },
        }),
        {} as { [key: string]: PortfolioStateHoldingBase },
      ),
    )
    // flatten array - merge all users data into one
    .reduce(
      (acc, curr) => {
        // merge all holdings
        getObjectEntries(curr).forEach(([key, value]) => {
          acc[key] = {
            invested: roundNDigits((acc[key]?.invested ?? 0) + value.invested),
            units: (acc[key]?.units ?? 0) + value.units,
            symbol: value.symbol,
            symbolType: value.symbolType,
          };
        });

        return acc;
      },
      {} as { [key: string]: PortfolioStateHoldingBase },
    );

  // add owner data
  if (isOwnerMember) {
    ownerData.holdingSnapshot.data.forEach((holding) => {
      memberHoldingSnapshots[holding.symbol] = {
        invested: roundNDigits((memberHoldingSnapshots[holding.symbol]?.invested ?? 0) + holding.invested),
        units: (memberHoldingSnapshots[holding.symbol]?.units ?? 0) + holding.units,
        symbol: holding.symbol,
        symbolType: holding.symbolType,
      };
    });
  }

  // calculate portfolioState from all members
  const memberPortfolioState = membersCurrentData
    .map((d) => d.portfolioState)
    .reduce(
      (acc, curr) => ({
        ...{
          balance: acc.balance + curr.balance,
          cashOnHand: acc.cashOnHand + curr.cashOnHand,
          holdingsBalance: acc.holdingsBalance + curr.holdingsBalance,
          invested: acc.invested + curr.invested,
          numberOfExecutedBuyTransactions: acc.numberOfExecutedBuyTransactions + curr.numberOfExecutedBuyTransactions,
          numberOfExecutedSellTransactions:
            acc.numberOfExecutedSellTransactions + curr.numberOfExecutedSellTransactions,
          startingCash: acc.startingCash + curr.startingCash,
          transactionFees: acc.transactionFees + curr.transactionFees,
          date: getCurrentDateDefaultFormat(),

          // ignore these
          firstTransactionDate: null,
          lastTransactionDate: null,
          accountResetDate: getCurrentDateDefaultFormat(),

          // calculate later
          previousBalanceChange: 0,
          previousBalanceChangePercentage: 0,
          totalGainsPercentage: 0,
          totalGainsValue: 0,
        },
      }),
      createEmptyPortfolioState(),
    );

  // calculate additional fields
  memberPortfolioState.totalGainsValue = roundNDigits(
    memberPortfolioState.holdingsBalance - memberPortfolioState.invested,
  );
  memberPortfolioState.totalGainsPercentage = roundNDigits(
    memberPortfolioState.totalGainsValue / memberPortfolioState.holdingsBalance,
  );
  memberPortfolioState.previousBalanceChange = roundNDigits(
    memberPortfolioState.balance - group.portfolioState.balance,
  );
  memberPortfolioState.previousBalanceChangePercentage = calculateGrowth(
    memberPortfolioState.balance,
    group.portfolioState.balance,
  );

  // create group members, calculate current group position
  const updatedGroupMembers = membersCurrentData
    .slice()
    .sort((a, b) => b.portfolioState.totalGainsValue - a.portfolioState.totalGainsValue)
    .map((d, index) =>
      transformUserToGroupMember(
        d,
        index + 1,
        membersPreviousData?.data?.find((m) => m.id === d.id),
      ),
    );

  // update last transactions for the group
  await groupDocumentTransactionsRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: lastTransactions,
  } satisfies GroupTransactionsData);

  // update members for the group
  await groupDocumentMembersRef(group.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: updatedGroupMembers,
  } satisfies GroupMembersData);

  // update owner for group
  await groupDocumentRef(group.id).update({
    ownerUser: transformUserToBase(ownerData),
    modifiedSubCollectionDate: getCurrentDateDefaultFormat(),
    portfolioState: memberPortfolioState,
  } satisfies Partial<GroupData>);

  // save holding snapshots
  await groupDocumentHoldingSnapshotsRef(group.id).update({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: getObjectEntries(memberHoldingSnapshots).map((d) => d[1]),
  } satisfies GroupHoldingSnapshotsData);

  // save portfolio state
  await groupDocumentPortfolioStateSnapshotsRef(group.id).update({
    data: FieldValue.arrayUnion(memberPortfolioState),
  });
};
