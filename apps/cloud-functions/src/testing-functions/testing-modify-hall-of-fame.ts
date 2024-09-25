import { HallOfFameUsers } from '@mm/api-types';
import { getCurrentDateDefaultFormat, getRandomNumber } from '@mm/shared/general-util';
import { aggregationHallOfFameUsersRef } from '../database';

/**
 * modifies hall of fame data for testing to display rank movements
 */
export const testingModifyHallOfFame = async (): Promise<void> => {
  const hallOfFameRef = aggregationHallOfFameUsersRef();
  const hallOfFameData = (await hallOfFameRef.get()).data();

  // check if hall of fame data exists
  if (!hallOfFameData) {
    console.error('Hall of fame data not found');
    return;
  }

  // modify hall of fame data for users
  hallOfFameRef.update({
    ...hallOfFameData,
    bestPortfolio: hallOfFameData.bestPortfolio.map((item, index) => ({
      ...item,
      portfolioTotalGainsPercentage: {
        date: item.portfolioTotalGainsPercentage?.date ?? getCurrentDateDefaultFormat(),
        rank: item.portfolioTotalGainsPercentage?.rank ?? index,
        rankPrevious: getRandomNumber(1, 100),
        rankChange: getRandomNumber(-10, 10),
      },
    })),
  } satisfies HallOfFameUsers);
};
