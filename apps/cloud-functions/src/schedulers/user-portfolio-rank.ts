import { RankingItem } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { usersCollectionDemoTradingRef } from '../models';

/**
 * Query all users (if profile is public and allowPortfolioCashAccount is true)
 * and order them based on their portfolio balance.
 */
export const userPortfolioRank = async (): Promise<void> => {
  const searchableRef = usersCollectionDemoTradingRef();

  // get user docs
  const userDocs = (await searchableRef.get()).docs;
  const sortedUser = userDocs.sort(
    (a, b) => b.data().portfolioState.totalGainsPercentage - a.data().portfolioState.totalGainsPercentage,
  );

  // update rank for each user
  for (let i = 0; i < sortedUser.length; i++) {
    const userDoc = sortedUser[i];
    const rank = i + 1;
    const userData = userDoc.data();

    const previousRank = userData.systemRank?.portfolioTotalGainsPercentage?.rank ?? null;
    const rankChange = previousRank ? previousRank - rank : null;

    const rankItem: RankingItem = {
      rank,
      rankPrevious: previousRank,
      rankChange: rankChange,
      date: getCurrentDateDefaultFormat(),
    };

    // update user
    userDoc.ref.update({
      'systemRank.portfolioTotalGainsPercentage': rankItem,
    });
  }
};
