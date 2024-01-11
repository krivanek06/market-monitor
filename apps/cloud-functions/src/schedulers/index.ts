import { onSchedule } from 'firebase-functions/v2/scheduler';
import { reloadMarketOverview } from '../market-functions/market-overview';
import { corsMiddleWareHttp, firebaseSimpleErrorLogger } from '../utils';
import { groupUpdateData } from './group-update-data';
import { hallOfFameUsers } from './hall-of-fame-users';
import { reloadDatabase } from './reload-database';
import { userPortfolioRank } from './user-portfolio-rank';
import { userUpdatePortfolio } from './user-update-portfolio';

export const run_user_portfolio_state_scheduler = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/15 1-2 * * *',
  },
  async () => {
    userUpdatePortfolio();
  },
);

/**
 * recalculates user portfolio rank only once par day after userUpdatePortfolio() finished
 * and also hall of fame users
 * monitor performance
 */
export const run_user_rank_and_hall_of_fame_scheduler = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '15 3 * * *',
  },
  async () => {
    const startTime = performance.now();

    console.log('calculate portfolio rank');
    await userPortfolioRank();

    console.log('calculate hall of fame users');
    await hallOfFameUsers();

    const endTime = performance.now();
    const secondsDiff = (endTime - startTime) / 1000;
    console.log(`Function took: ${secondsDiff} seconds`);
  },
);

export const run_group_update_data_scheduler = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/15 2-3 * * *',
  },
  async () => {
    groupUpdateData();
  },
);

export const run_reload_market_overview = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 22 * * 5',
  },
  async () => {
    reloadMarketOverview();
  },
);

// DEVELOPMENT ----------------------------

export const test_me = firebaseSimpleErrorLogger(
  'test_function',
  corsMiddleWareHttp(async (request, response) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Function can be executed only in development mode');
      return;
    }

    console.log('--- start ---');

    // console.log('[Users]: update portfolio');
    // await userUpdatePortfolio();
    // console.log('[Groups]: update portfolio');
    // await groupUpdateData();
    // console.log('[Users]: update rank');
    // await userPortfolioRank();
    // console.log('[Users]: update hall of fame');
    //await hallOfFameUsers();
    // console.log('[Groups]: update rank');
    // await groupPortfolioRank();
    // console.log('[Groups]: update hall of fame');
    //await hallOfFameGroups();

    // wait 5 second
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    await reloadDatabase();

    console.log('--- finished ---');
  }),
);
