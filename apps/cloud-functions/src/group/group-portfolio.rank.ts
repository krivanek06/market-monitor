import { groupsCollectionRef } from '../models';

/**
 * for each group order (calculate) the portfolio rank based on totalGainsPercentage
 */
export const groupPortfolioRank = async (): Promise<void> => {
  const searchableRef = groupsCollectionRef()
    .where('isClosed', '==', false)
    .where('isDemo', '!=', true)
    .orderBy('portfolioState.totalGainsPercentage', 'desc');

  // get group docs
  const groupDocs = await searchableRef.get();

  // update rank for each group
  for (let i = 0; i < groupDocs.docs.length; i++) {
    const groupDoc = groupDocs.docs[i];
    const rank = i + 1;
    const groupData = groupDoc.data();

    const previousRank = groupData.systemRank.portfolioTotalGainsPercentage?.rank ?? null;
    const rankChange = previousRank ? previousRank - rank : null;

    // update group
    groupDoc.ref.update({
      'systemRank.portfolioTotalGainsPercentage': {
        rank,
        rankPrevious: previousRank,
        rankChange: rankChange,
      },
    });
  }
};
