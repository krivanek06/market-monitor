import { HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT, HALL_OF_FAME_PORTFOLIO_TOP_LIMIT } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { usersCollectionRef } from '../models';
import { aggregationHallOfFameUsersRef } from '../models/aggregation';
import { transformUserToBase } from '../utils';

export const hallOfFameUsers = async (): Promise<void> => {
  const searchableRef = usersCollectionRef().where('features.allowAccessHallOfFame', '==', true);

  // get top users by total gains
  const userBestProfitRef = searchableRef
    .orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_TOP_LIMIT);
  // get worst users by total gains
  const userWorstProfitRef = searchableRef
    .orderBy('systemRank.portfolioTotalGainsPercentage.rank', 'desc')
    .limit(HALL_OF_FAME_PORTFOLIO_TOP_LIMIT);
  // get top daily profit users
  const userBestDailyProfitRef = searchableRef
    .orderBy('portfolioState.previousBalanceChangePercentage', 'desc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);
  // get worst daily profit users
  const userWorstDailyProfitRef = searchableRef
    .orderBy('portfolioState.previousBalanceChangePercentage', 'asc')
    .limit(HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT);

  // get documents
  const [userBestProfitDoc, userWorstProfitDoc, userBestDailyProfitDoc, userWorstDailyProfitDoc] = await Promise.all([
    userBestProfitRef.get(),
    userWorstProfitRef.get(),
    userBestDailyProfitRef.get(),
    userWorstDailyProfitRef.get(),
  ]);

  // map docs to data - just in case remove undefined
  const userBestProfitData = userBestProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformUserToBase(d));
  const userWorstProfitData = userWorstProfitDoc.docs
    .map((d) => d.data())
    .filter((d) => !!d)
    .map((d) => transformUserToBase(d));
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
    worstPortfolio: userWorstProfitData,
    bestDailyGains: userBestDailyProfitData,
    worstDailyGains: userWorstDailyProfitData,
    date: getCurrentDateDefaultFormat(),
  });
};
