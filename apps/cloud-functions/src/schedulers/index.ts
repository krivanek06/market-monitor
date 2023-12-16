import { onSchedule } from 'firebase-functions/v2/scheduler';
import { reloadMarketOverview } from '../market-functions/market-overview';
import { corsMiddleWareHttp, firebaseSimpleErrorLogger } from '../utils';
import { groupUpdateDataScheduler } from './group-update-data-scheduler';
import { userUpdatePortfolioScheduler } from './user-update-portfolio-scheduler';

// TESTING
export const test_me = firebaseSimpleErrorLogger(
  'test_function',
  corsMiddleWareHttp(async (request, response) => {
    console.log('Run Test Function');

    await userUpdatePortfolioScheduler();
    console.log('update groups');
    await groupUpdateDataScheduler();
  }),
);

export const run_user_portfolio_state_scheduler = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/5 1-2 * * *',
  },
  async () => {
    userUpdatePortfolioScheduler();
  },
);

export const run_group_update_data_scheduler = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/5 2-3 * * *',
  },
  async () => {
    groupUpdateDataScheduler();
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
