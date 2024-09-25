import { RankingItem } from '@mm/api-types';
import { getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import { usersCollectionDemoTradingRef } from '../database';

/**
 * Query all trading user accounts
 * and order them based on their portfolio balance.
 */
export const userPortfolioRank = async (): Promise<void> => {
  const searchableRef = usersCollectionDemoTradingRef();

  // get user docs
  const userDocs = (await searchableRef.get()).docs;
  const sortedUser = userDocs.sort((a, b) => b.data().portfolioState.balance - a.data().portfolioState.balance);

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
