import { HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT, HALL_OF_FAME_PORTFOLIO_TOP_LIMIT } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { groupsCollectionRef } from '../models';
import { aggregationHallOfFameGroupsRef } from '../models/aggregation';
import { transformGroupToBase } from '../utils';

export const hallOfFameGroups = async (): Promise<void> => {
  const searchableRef = groupsCollectionRef().where('isClosed', '==', false);

  // get top users by total gains
  const groupBestProfitRef = searchableRef
    .orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_TOP_LIMIT);
  // get worst groups by total gains
  const groupWorstProfitRef = searchableRef
    .orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'desc')
    .limit(HALL_OF_FAME_PORTFOLIO_TOP_LIMIT);
  // get top daily profit groups
  const groupBestDailyProfitRef = searchableRef
    .orderBy('portfolioState.previousBalanceChangePercentage', 'desc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);
  // get worst daily profit groups
  const groupWorstDailyProfitRef = searchableRef
    .orderBy('portfolioState.previousBalanceChangePercentage', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);

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
