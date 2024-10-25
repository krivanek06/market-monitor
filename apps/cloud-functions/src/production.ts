import { GroupGeneralActions, OutstandingOrder, UserCreateDemoAccountInput } from '@mm/api-types';
import { onDocumentUpdated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from './group';
import { groupGeneralActions } from './group/group-general-actions';
import { onOutstandingOrderCreate, onOutstandingOrderDelete } from './outstanding-order';
import { onTransactionUpdateForUserId } from './portfolio';
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
 * TRANSACTIONS
 */
export const onTransactionUpdate = onDocumentUpdated('users/{userId}/more_information/transactions', async (event) =>
  onTransactionUpdateForUserId(event.params.userId),
);

/** ------------------------------------------ */

/**
 * OUTSTANDING ORDERS
 */

export const on_outstanding_order_change = onDocumentWritten('outstanding_orders/{orderId}', async (event) => {
  const newValue = event.data?.after.data() as OutstandingOrder | undefined;
  const previousValue = event.data?.before.data() as OutstandingOrder | undefined;

  // not new value - it was deleted
  if (!newValue && previousValue) {
    onOutstandingOrderDelete(previousValue);
  }

  // new value - it was created
  else if (newValue && !previousValue) {
    onOutstandingOrderCreate(newValue);
  }

  // new value - it was updated
  else if (newValue && previousValue) {
    onOutstandingOrderCreate(newValue);
  }
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
