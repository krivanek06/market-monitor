import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from '../group';
import { userHallOfFame, userPortfolioRank, userPortfolioUpdate } from '../user';
import { isFirebaseEmulator } from '../utils';

export const runALlSchedulers = async (): Promise<void> => {
  if (!isFirebaseEmulator()) {
    console.warn('reloadDatabase() should only be used for testing / local development');
    return;
  }

  const startTime = performance.now();

  // run all schedulers
  console.log('[Users]: update portfolio');
  await userPortfolioUpdate();
  console.log('[Groups]: update portfolio');
  await groupUpdateData();
  console.log('[Users]: update rank');
  await userPortfolioRank();
  console.log('[Users]: update hall of fame');
  await userHallOfFame();
  console.log('[Groups]: update rank');
  await groupPortfolioRank();
  console.log('[Groups]: update hall of fame');
  await groupHallOfFame();

  const endTime = performance.now();
  const secondsDiff = Math.round((endTime - startTime) / 1000);
  console.log(`Function took: ~${secondsDiff} seconds`);
};
