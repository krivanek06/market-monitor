import { groupPortfolioRank } from '../schedulers/group-portfolio.rank';
import { groupUpdateData } from '../schedulers/group-update-data';
import { hallOfFameGroups } from '../schedulers/hall-of-fame-groups';
import { hallOfFameUsers } from '../schedulers/hall-of-fame-users';
import { userPortfolioRank } from '../schedulers/user-portfolio-rank';
import { userPortfolioUpdate } from '../schedulers/user-portfolio-update';
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
  await hallOfFameUsers();
  console.log('[Groups]: update rank');
  await groupPortfolioRank();
  console.log('[Groups]: update hall of fame');
  await hallOfFameGroups();

  const endTime = performance.now();
  const secondsDiff = Math.round((endTime - startTime) / 1000);
  console.log(`Function took: ~${secondsDiff} seconds`);
};
