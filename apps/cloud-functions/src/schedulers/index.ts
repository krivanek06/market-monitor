import { FIREBASE_DEPLOYMENT } from '@mm/api-types';
import axios from 'axios';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from '../group';
import {
  userDeactivateInactiveAccounts,
  userDeleteDemoAccounts,
  userHallOfFame,
  userPortfolioRank,
  userPortfolioUpdate,
} from '../user';
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
    axios.get(`https://user-update-data-request-${FIREBASE_DEPLOYMENT}`);
  },
);

/**
 * every 5 minute of each hour from Monday to Friday
 */
export const run_scheduler_update_groups = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '5 * * * 1-5',
  },
  async () => {
    axios.get(`https://group-update-data-request-${FIREBASE_DEPLOYMENT}`);
  },
);

export const run_scheduler_once_a_day = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 1 * * *',
  },
  async () => {
    axios.get(`https://user-inactivate-or-delete-request-${FIREBASE_DEPLOYMENT}`);
  },
);

export const run_scheduler_once_per_week = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 22 * * 5',
  },
  async () => {
    axios.get(`https://getmarketoverviewdata-${FIREBASE_DEPLOYMENT}`);
  },
);

/**
 * create http call to update user portfolio - possible to fire from scheduler and from admin dashboard
 */
export const group_update_data_request = onRequest({ timeoutSeconds: 200 }, async (req, res) => {
  await measureFunctionExecutionTime(async () => {
    // update user portfolio
    console.log('[Groups]: update portfolio');
    await groupUpdateData();

    // update user rank
    console.log('[Groups]: update rank');
    await groupPortfolioRank();

    // update user hall of fame
    console.log('[Groups]: update hall of fame');
    await groupHallOfFame();

    res.send('ok');
  });
});

/**
 * create http call to update user portfolio - possible to fire from scheduler and from admin dashboard
 */
export const user_update_data_request = onRequest({ timeoutSeconds: 200 }, async (req, res) => {
  await measureFunctionExecutionTime(async () => {
    // update user portfolio
    console.log('[Users]: update portfolio');
    await userPortfolioUpdate();

    // update user rank
    console.log('[Users]: update rank');
    await userPortfolioRank();

    // update user hall of fame
    console.log('[Users]: update hall of fame');
    await userHallOfFame();

    res.send('ok');
  });
});

export const user_inactivate_or_delete_request = onRequest({ timeoutSeconds: 200 }, async (req, res) => {
  await measureFunctionExecutionTime(async () => {
    console.log('[Users]: deactivate necessary accounts');
    await userDeactivateInactiveAccounts();

    console.log('[Users]: delete demo or inactive accounts');
    await userDeleteDemoAccounts();

    // console.log('[Users]: delete old inactive accounts');
    // await userDeleteNormalAccounts();

    res.send('ok');
  });
});
