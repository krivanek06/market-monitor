import { GroupGeneralActions, UserCreateDemoAccountInput } from '@mm/api-types';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from './group';
import { groupGeneralActions } from './group/group-general-actions';
import {
  userCreateAccount,
  userCreateAccountDemo,
  userDeleteAccount,
  userDeleteDemoAccounts,
  userHallOfFame,
  userPortfolioRank,
  userPortfolioUpdate,
} from './user';
import { measureFunctionExecutionTime } from './utils';

/**
 * USERS
 */

export const userCreateAccountCall = onCall((request: CallableRequest<void>) => userCreateAccount(request.auth?.uid));

export const userCreateAccountDemoCall = onCall((request: CallableRequest<UserCreateDemoAccountInput>) =>
  userCreateAccountDemo(request.data),
);

export const userDeleteAccountCall = onCall(async (request: CallableRequest<void>) =>
  userDeleteAccount(request.auth?.uid),
);

/** ------------------------------------------ */

/**
 * GROUPS
 */
export const groupGeneralActionsCall = onCall((request: CallableRequest<GroupGeneralActions>) =>
  groupGeneralActions(request.auth?.uid, request.data),
);

/** ------------------------------------------ */

/**
 * every 5 minutes between 22:00 and 23:00
 */
export const run_scheduler_update_users = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/5 22-23 * * *',
  },
  async () => {
    await measureFunctionExecutionTime(async () => {
      console.log('[Users]: update portfolio');
      await userPortfolioUpdate();
    });
  },
);

/** run at 1am */
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
