import {
  HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT,
  HALL_OF_FAME_PORTFOLIO_TOP_LIMIT,
  HallOfFameTopRankData,
  UserBase,
} from '@mm/api-types';
import { getCurrentDateDetailsFormat } from '@mm/shared/general-util';
import { aggregationHallOfFameUsersRef, usersCollectionDemoTradingRef } from '../models';
import { transformUserToBase } from '../utils';

export const userHallOfFame = async (): Promise<void> => {
  const searchableRef = usersCollectionDemoTradingRef();

  // get top users by total gains
  const userBestProfitRef = searchableRef
    .orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_TOP_LIMIT);
  // get top daily profit users
  const userBestDailyProfitRef = searchableRef
    .where('portfolioState.previousBalanceChangePercentage', '>', 0)
    .orderBy('portfolioState.previousBalanceChangePercentage', 'desc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);
  // get worst daily profit users
  const userWorstDailyProfitRef = searchableRef
    .where('portfolioState.previousBalanceChangePercentage', '<', 0)
    .orderBy('portfolioState.previousBalanceChangePercentage', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);

  // get documents
  const [userBestProfitDoc, userBestDailyProfitDoc, userWorstDailyProfitDoc] = await Promise.all([
    userBestProfitRef.get(),
    userBestDailyProfitRef.get(),
    userWorstDailyProfitRef.get(),
  ]);

  // map docs to data - just in case remove undefined
  const userBestProfitData = userBestProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map(
      (d) =>
        ({
          item: transformUserToBase(d),
          portfolioTotalGainsPercentage: d.systemRank?.portfolioTotalGainsPercentage,
        }) satisfies HallOfFameTopRankData<UserBase>,
    );

  const userBestDailyProfitData = userBestDailyProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformUserToBase(d));

  const userWorstDailyProfitData = userWorstDailyProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformUserToBase(d));

  // update document
  const docRef = aggregationHallOfFameUsersRef();
  docRef.set({
    bestPortfolio: userBestProfitData,
    bestDailyGains: userBestDailyProfitData,
    worstDailyGains: userWorstDailyProfitData,
    date: getCurrentDateDetailsFormat(),
  });
};
