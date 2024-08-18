import { onSchedule } from 'firebase-functions/v2/scheduler';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from '../group';
import { userDeleteDemoAccounts, userHallOfFame, userPortfolioRank, userPortfolioUpdate } from '../user';
import { measureFunctionExecutionTime } from '../utils';

/**
 * every 30 minutes from Monday to Friday
 */
export const run_scheduler_update_users = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/30 * * * 1-5',
  },
  async () => {
    await measureFunctionExecutionTime(async () => {
      console.log('[Users]: update portfolio');
      await userPortfolioUpdate();
    });
  },
);

export const run_scheduler_once_a_day = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 1 * * *',
  },
  async () => {
    await measureFunctionExecutionTime(async () => {
      // Skipping deactivating user - too few users in the app - probably not necessary
      // console.log('[Users]: deactivate necessary accounts');
      // await userDeactivateInactiveAccounts();

      // delete demo accounts
      console.log('[Users]: delete demo or inactive accounts');
      await userDeleteDemoAccounts();

      // update user portfolio
      console.log('[Groups]: update portfolio');
      await groupUpdateData();

      // update user rank
      console.log('[Users]: update rank');
      await userPortfolioRank();

      // update user hall of fame
      console.log('[Users]: update hall of fame');
      await userHallOfFame();

      // update user rank
      console.log('[Groups]: update rank');
      await groupPortfolioRank();

      // update user hall of fame
      console.log('[Groups]: update hall of fame');
      await groupHallOfFame();
    });
  },
);
