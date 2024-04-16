import axios from 'axios';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from '../group';
import { reloadMarketOverview } from '../market-functions/market-overview';
import {
  userDeactivateInactiveAccounts,
  userDeleteAccountInactive,
  userHallOfFame,
  userPortfolioRank,
  userPortfolioUpdate,
} from '../user';
import { measureFunctionExecutionTime } from '../utils';

/**
 * every 20 minutes from Monday to Friday
 */
export const run_scheduler_frequent_week_days = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/30 * * * 1-5',
  },
  async () => {
    axios.get('https://user-portfolio-update-request-jhgz46ksfq-uc.a.run.app');
  },
);

export const run_scheduler_once_a_day = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 1 * * *',
  },
  async () => {
    measureFunctionExecutionTime(async () => {
      console.log('[Users]: deactivate necessary accounts');
      await userDeactivateInactiveAccounts();

      console.log('[Users]: delete demo or inactive accounts');
      await userDeleteAccountInactive();
    });
  },
);

/**
 * every hour, every day of week
 */
export const run_scheduler_once_per_hours_week_days = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 */1 * * 1-5',
  },
  async () => {
    measureFunctionExecutionTime(async () => {
      console.log('[Groups]: update data');
      await groupUpdateData();

      console.log('[Users]: update rank');
      await userPortfolioRank();

      console.log('[Groups]: update rank');
      await groupPortfolioRank();

      console.log('[Users]: update hall of fame');
      await userHallOfFame();

      console.log('[Groups]: update hall of fame');
      await groupHallOfFame();
    });
  },
);

export const run_scheduler_once_per_week = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 22 * * 5',
  },
  async () => {
    reloadMarketOverview();
  },
);

/**
 * create http call to update user portfolio - possible to fire from scheduler and from admin dashboard
 */
export const user_portfolio_update_request = onRequest({ timeoutSeconds: 200 }, async (req, res) => {
  await measureFunctionExecutionTime(userPortfolioUpdate);
  res.send('ok');
});
