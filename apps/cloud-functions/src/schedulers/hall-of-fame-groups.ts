import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { groupsCollectionRef } from '../models';
import { aggregationHallOfFameGroupsRef } from '../models/aggregation';
import { transformGroupToBase } from '../utils';

export const hallOfFameGroups = async (): Promise<void> => {
  const searchableRef = groupsCollectionRef().where('isClosed', '==', false);

  // get top users by total gains
  const groupBestProfitRef = searchableRef.orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'asc').limit(25);
  // get worst groups by total gains
  const groupWorstProfitRef = searchableRef.orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'desc').limit(25);
  // get top daily profit groups
  const groupBestDailyProfitRef = searchableRef
    .orderBy('portfolioState.previousBalanceChangePercentage', 'desc')
    .limit(10);
  // get worst daily profit groups
  const groupWorstDailyProfitRef = searchableRef
    .orderBy('portfolioState.previousBalanceChangePercentage', 'asc')
    .limit(10);

  // get documents
  const [groupBestProfitDoc, groupWorstProfitDoc, groupBestDailyProfitDoc, groupWorstDailyProfitDoc] =
    await Promise.all([
      groupBestProfitRef.get(),
      groupWorstProfitRef.get(),
      groupBestDailyProfitRef.get(),
      groupWorstDailyProfitRef.get(),
    ]);

  // map docs to data - just in case remove undefined
  const groupBestProfitData = groupBestProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformGroupToBase(d));
  const groupWorstProfitData = groupWorstProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformGroupToBase(d));
  const groupBestDailyProfitData = groupBestDailyProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformGroupToBase(d));
  const groupWorstDailyProfitData = groupWorstDailyProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformGroupToBase(d));

  // update document
  const docRef = aggregationHallOfFameGroupsRef();
  docRef.set({
    bestPortfolio: groupBestProfitData,
    worstPortfolio: groupWorstProfitData,
    bestDailyGains: groupBestDailyProfitData,
    worstDailyGains: groupWorstDailyProfitData,
    date: getCurrentDateDefaultFormat(),
  });
};
