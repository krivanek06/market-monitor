import {
  GROUP_HOLDING_LIMIT,
  GroupData,
  GroupHoldingSnapshotsData,
  GroupMembersData,
  GroupPortfolioStateSnapshotsData,
  GroupTransactionsData,
  PortfolioState,
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
  transformUserToBase,
  transformUserToGroupMember,
} from '@mm/shared/general-util';
import {
  groupDocumentHoldingSnapshotsRef,
  groupDocumentMembersRef,
  groupDocumentPortfolioStateSnapshotsRef,
  groupDocumentRef,
  groupDocumentTransactionsRef,
  groupsCollectionRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '../database';

/**
 * for each group update:
 * - members
 * - transactions
 * - owner
 */
export const groupUpdateData = async (): Promise<void> => {
  // get all non closed groups
  const group = await groupsCollectionRef()
    .where('isClosed', '==', false)
    .orderBy('modifiedSubCollectionDate', 'asc')
    .get();

  console.log(`[Groups]: Loaded ${group.docs.length} groups`);

  for await (const groupDoc of group.docs) {
    const groupData = groupDoc.data();
    console.log(`[Groups]: Updating ${groupData.id}, name: ${groupData.name}`);
    try {
      await groupCopyMembersAndTransactions(groupData);
    } catch (e) {
      console.error(`Error updating group ${groupData.id}, name: ${groupData.name}`, e);
    }
  }
};

/**
 * for the provided group, copy member transactions into the group, updates current holdings and
 * saved portfolio current snapshot
 *
 */
const groupCopyMembersAndTransactions = async (group: GroupData): Promise<void> => {
  // load all members of the group
  const ownerData = (await userDocumentRef(group.ownerUserId).get()).data();

  if (!ownerData) {
    console.error(`Owner not found for group ${group.id}`);
    return;
  }

  // load group member data from last computation
  const membersPreviousData = (await groupDocumentMembersRef(group.id).get()).data();
  const portfolioSnapshotsData = (await groupDocumentPortfolioStateSnapshotsRef(group.id).get()).data();

  if (!portfolioSnapshotsData || !membersPreviousData) {
    console.error(`No previous data for group ${group.id}`);
    return;
  }

  // load userData all members of the group
  const membersCurrentData = (await Promise.all(group.memberUserIds.map((id) => userDocumentRef(id).get())))
    .map((d) => d.data())
    .filter((d): d is UserData => !!d);

  // load all transactions of the group members
  const memberTransactionHistory = await Promise.all(
    membersCurrentData.map((m) => userDocumentTransactionHistoryRef(m.id).get()),
  );

  // merge all data together
  const memberTransactionHistoryData = memberTransactionHistory.map((d) => d.data()).map((d) => d?.transactions ?? []);
  // get last, best and worst transactions by all users
  const lastTransactions = getTransactionData(memberTransactionHistoryData);

  // calculate holdings from all members - top 100 by invested
  const memberHoldingSnapshots = calculateGroupMembersHoldings(membersCurrentData)
    .sort((a, b) => b.invested - a.invested)
    .slice(0, GROUP_HOLDING_LIMIT);

  // remove last portfolio state if it is from today - because we will recalculate it again
  const portfolioSnapshotsNewData =
    portfolioSnapshotsData.data.at(-1)?.date === getCurrentDateDefaultFormat()
      ? portfolioSnapshotsData.data.slice(0, -1)
      : portfolioSnapshotsData.data;

  // get last portfolio state from previous day or starting portfolio state
  const previousPortfolio = portfolioSnapshotsNewData.at(-1) ?? group.portfolioState;
  // calculate portfolioState from all members
  const memberPortfolioState = calculateGroupMembersPortfolioState(membersCurrentData, previousPortfolio);

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
    data: lastTransactions.lastTransactions,
    transactionBestReturn: lastTransactions.bestTransactions,
    transactionsWorstReturn: lastTransactions.worstTransactions,
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
    data: memberHoldingSnapshots,
  } satisfies GroupHoldingSnapshotsData);

  // save portfolio state
  await groupDocumentPortfolioStateSnapshotsRef(group.id).update({
    data: [...portfolioSnapshotsNewData, memberPortfolioState],
    lastModifiedDate: getCurrentDateDefaultFormat(),
  } satisfies GroupPortfolioStateSnapshotsData);
};

/**
 *
 * @param usersAllTransactions - all transactions of all group members
 * @returns - last, best and worst transactions
 */
const getTransactionData = (
  usersAllTransactions: PortfolioTransaction[][],
): {
  lastTransactions: PortfolioTransaction[];
  bestTransactions: PortfolioTransaction[];
  worstTransactions: PortfolioTransaction[];
} => {
  // combine all transactions
  const usersAllTransactionsCombined = usersAllTransactions.reduce(
    (acc, val) => [...acc, ...val],
    [] as PortfolioTransaction[],
  );

  // get last N transactions for everybody - order by date desc
  const lastTransactions = usersAllTransactions
    .reduce((acc, val) => [...acc, ...val.slice(0, 10)], [] as PortfolioTransaction[])
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 150);

  // get best N transactions
  const bestTransactions = usersAllTransactionsCombined
    .filter((d) => d.returnValue > 0)
    .sort((a, b) => b.returnValue - a.returnValue)
    .slice(0, 25);

  // get worst N transactions
  const worstTransactions = usersAllTransactionsCombined
    .filter((d) => d.returnValue < 0)
    .sort((a, b) => a.returnValue - b.returnValue)
    .slice(0, 25);

  return {
    lastTransactions,
    bestTransactions,
    worstTransactions,
  };
};

/**
 *
 * @param groupMembers - all members of the group
 * @returns - merged holdings from all members
 */
const calculateGroupMembersHoldings = (groupMembers: UserData[]): PortfolioStateHoldingBase[] => {
  const memberHoldingSnapshots = groupMembers.reduce(
    (acc, curr) => ({
      ...acc,
      ...curr.holdingSnapshot.data.reduce(
        (accHolding, currHolding) => ({
          ...accHolding,
          [currHolding.symbol]: {
            invested: currHolding.invested + (acc[currHolding.symbol]?.invested ?? 0),
            units: currHolding.units + (acc[currHolding.symbol]?.units ?? 0),
            symbol: currHolding.symbol,
            symbolType: currHolding.symbolType,
            sector: currHolding.sector,
            breakEvenPrice: currHolding.breakEvenPrice,
            userIds: [...(acc[currHolding.symbol]?.userIds ?? []), curr.id], // member id
          } satisfies PortfolioStateHoldingBase,
        }),
        {} as { [key: string]: PortfolioStateHoldingBase },
      ),
    }),
    {} as { [key: string]: PortfolioStateHoldingBase },
  );

  return getObjectEntries(memberHoldingSnapshots).map((d) => d[1]);
};

/**
 *
 * @param groupMembers - all members of the group
 * @param groupPreviousPortfolioState - previous portfolio state of the group (from previous date)
 * @returns - portfolio state calculated from all members
 */
export const calculateGroupMembersPortfolioState = (
  groupMembers: UserData[],
  groupPreviousPortfolioState: PortfolioState,
): PortfolioState => {
  const memberPortfolioState = groupMembers
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
          transactionProfit: acc.transactionProfit + curr.transactionProfit,
          date: getCurrentDateDefaultFormat(),

          // ignore these
          firstTransactionDate: null,
          lastTransactionDate: null,

          // calculate later
          previousBalanceChange: 0,
          previousBalanceChangePercentage: 0,
          totalGainsPercentage: 0,
          totalGainsValue: 0,
        },
      }),
      createEmptyPortfolioState(),
    );

  const memberPortfolioStateUpdate = {
    ...memberPortfolioState,

    // round all values
    balance: roundNDigits(memberPortfolioState.balance),
    invested: roundNDigits(memberPortfolioState.invested),
    holdingsBalance: roundNDigits(memberPortfolioState.holdingsBalance),
    transactionFees: roundNDigits(memberPortfolioState.transactionFees),

    // additional calculations
    totalGainsValue: roundNDigits(memberPortfolioState.balance - memberPortfolioState.startingCash),
    totalGainsPercentage: calculateGrowth(memberPortfolioState.balance, memberPortfolioState.startingCash),
    previousBalanceChange: roundNDigits(memberPortfolioState.balance - groupPreviousPortfolioState.balance),
    previousBalanceChangePercentage: calculateGrowth(memberPortfolioState.balance, groupPreviousPortfolioState.balance),
  } satisfies PortfolioState;

  return memberPortfolioStateUpdate;
};
