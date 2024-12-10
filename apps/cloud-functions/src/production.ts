import {
  GroupGeneralActions,
  OutstandingOrder,
  TradingSimulatorGeneralActions,
  UserCreateDemoAccountInput,
} from '@mm/api-types';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from './group';
import { groupGeneralActions } from './group/group-general-actions';
import { outstandingOrderExecute, outstandingOrdersExecuteAll } from './outstanding-order';
import { tradingSimulatorGeneralActions } from './trading-simulator/trading-simulator-general-actions';
import { tradingSimulatorStateVerification } from './trading-simulator/trading-simulator-state-verification';
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

const region = 'europe-central2';
const allowedUrl = ['https://dashboard.ggfinance.io', 'http://localhost:4200/']; // in the future maybe configure this -> ['https://dashboard.ggfinance.io', 'http://localhost:4200/'];

/**
 * USERS
 */

export const userCreateAccountCall = onCall(
  {
    region: region,
    cors: allowedUrl,
  },
  (request: CallableRequest<void>) => userCreateAccount(request.auth?.uid),
);

export const userCreateAccountDemoCall = onCall(
  {
    region: region,
    cors: allowedUrl,
    memory: '512MiB',
  },
  (request: CallableRequest<UserCreateDemoAccountInput>) => userCreateAccountDemo(request.data),
);

export const userDeleteAccountCall = onCall(
  {
    region: region,
    cors: allowedUrl,
  },
  (request: CallableRequest<void>) => userDeleteAccount(request.auth?.uid),
);

/** ------------------------------------------ */
/**
 * GROUPS
 */
export const groupGeneralActionsCall = onCall(
  {
    region: region,
    cors: allowedUrl,
  },
  (request: CallableRequest<GroupGeneralActions>) => groupGeneralActions(request.auth?.uid, request.data),
);

/** ------------------------------------------ */
/**
 * TRADING SIMULATOR
 */

export const tradingSimulatorActionCall = onCall(
  {
    region: region,
    cors: allowedUrl,
  },
  (request: CallableRequest<TradingSimulatorGeneralActions>) =>
    tradingSimulatorGeneralActions(request.auth?.uid, request.data),
);

/** ------------------------------------------ */
/**
 * OUTSTANDING ORDERS
 */

export const outstandingOrderNewDocument = onDocumentCreated('outstanding_orders/{docId}', async (event) => {
  await measureFunctionExecutionTime(async () => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }
    const data = snapshot.data() as OutstandingOrder;
    await outstandingOrderExecute(data);
  });
});

/** ------------------------------------------ */

/**
 * every 5 minutes between 22:00 and 23:00
 */
export const run_scheduler_update_users = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/5 21-22 * * *',
    region: region,
    timeZone: 'Europe/Berlin',
  },
  async () => {
    await measureFunctionExecutionTime(async () => {
      console.log('[Users]: update portfolio');
      await userPortfolioUpdate();
    });
  },
);

export const run_scheduler_frequent = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '*/5 * * * *', // every 5 minutes
    region: region,
    timeZone: 'Europe/Berlin',
  },
  async () => {
    await measureFunctionExecutionTime(async () => {
      // check if the simulator should start or increment the round
      await tradingSimulatorStateVerification();

      // check if there is any open order to execute
      await outstandingOrdersExecuteAll();
    });
  },
);

/** run at 1am */
export const run_scheduler_once_a_day = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 1 * * *',
    region: region,
    timeZone: 'Europe/Berlin',
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
