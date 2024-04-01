import { roundNDigits } from '@mm/shared/general-util';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { reloadMarketOverview } from '../market-functions/market-overview';
import { groupUpdateData } from './group-update-data';
import { hallOfFameGroups } from './hall-of-fame-groups';
import { hallOfFameUsers } from './hall-of-fame-users';
import { userPortfolioRank } from './user-portfolio-rank';
import { userPortfolioUpdate } from './user-portfolio-update';

export const run_user_portfolio_state_scheduler = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/15 1-2 * * *',
  },
  async () => {
    userPortfolioUpdate();
  },
);

/**
 * recalculates user portfolio rank only once par day after userUpdatePortfolio() finished
 * and also hall of fame users
 * at: At 03:15 every day
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

    console.log('calculate hall of fame groups');
    await hallOfFameGroups();

    const endTime = performance.now();
    const secondsDiff = roundNDigits((endTime - startTime) / 1000);
    console.log(`Function took: ${secondsDiff} seconds`);
  },
);

export const run_group_update_data_scheduler = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/15 2 * * *',
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
