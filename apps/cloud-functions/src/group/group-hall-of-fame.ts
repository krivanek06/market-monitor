import {
  GroupBase,
  HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT,
  HALL_OF_FAME_PORTFOLIO_TOP_LIMIT,
  HallOfFameTopRankData,
} from '@mm/api-types';
import { getCurrentDateDetailsFormat } from '@mm/shared/general-util';
import { groupsCollectionRef } from '../models';
import { aggregationHallOfFameGroupsRef } from '../models/aggregation';
import { transformGroupToBase } from '../utils';

export const groupHallOfFame = async (): Promise<void> => {
  const searchableRef = groupsCollectionRef().where('isClosed', '==', false);

  // get top users by total gains
  const groupBestProfitRef = searchableRef
    .orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_TOP_LIMIT);
  // get top daily profit groups
  const groupBestDailyProfitRef = searchableRef
    .where('portfolioState.previousBalanceChangePercentage', '>', 0)
    .orderBy('portfolioState.previousBalanceChangePercentage', 'desc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);
  // get worst daily profit groups
  const groupWorstDailyProfitRef = searchableRef
    .where('portfolioState.previousBalanceChangePercentage', '<', 0)
    .orderBy('portfolioState.previousBalanceChangePercentage', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);

  // get documents
  const [groupBestProfitDoc, groupBestDailyProfitDoc, groupWorstDailyProfitDoc] = await Promise.all([
    groupBestProfitRef.get(),
    groupBestDailyProfitRef.get(),
    groupWorstDailyProfitRef.get(),
  ]);

  // map docs to data - just in case remove undefined
  const groupBestProfitData = groupBestProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map(
      (d) =>
        ({
          item: transformGroupToBase(d),
          portfolioTotalGainsPercentage: d.systemRank.portfolioTotalGainsPercentage,
        }) satisfies HallOfFameTopRankData<GroupBase>,
    );

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
    bestDailyGains: groupBestDailyProfitData,
    worstDailyGains: groupWorstDailyProfitData,
    date: getCurrentDateDetailsFormat(),
  });
};
