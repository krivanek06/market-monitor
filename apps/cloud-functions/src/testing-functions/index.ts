import { CallableRequest, onCall, onRequest } from 'firebase-functions/v2/https';
import { userDocumentRef } from '../database';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from '../group';
import { outstandingOrdersExecuteAll } from '../outstanding-order';
import { recalculateUserPortfolioStateToUser } from '../portfolio';
import { run_scheduler_once_a_day, run_scheduler_update_users } from '../production';
import {
  userDeactivateInactiveAccounts,
  userDeleteDemoAccounts,
  userDeleteNormalAccounts,
  userHallOfFame,
  userPortfolioRank,
} from '../user';
import { isFirebaseEmulator, measureFunctionExecutionTime } from './../utils';
import { testReloadDatabase } from './reload-database';
import { testingModifyHallOfFame } from './testing-modify-hall-of-fame';

type FType =
  | 'test_reload_database'
  | 'test_function'
  | 'test_delete_user_accounts'
  | 'run_scheduler_once_a_day'
  | 'run_scheduler_update_users'
  | 'run_outstanding_order_execute'
  | 'recalculate_user_portfolio_state';

export const testing_function = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  // prevent running in production
  if (!isFirebaseEmulator()) {
    console.warn('Function can be executed only in development mode');
    return;
  }

  const query = req.query;
  const functionType = query?.['functionType'] as FType | undefined;

  if (!functionType) {
    res.status(400).send('Function type is missing');
    return;
  }

  // measure time
  await measureFunctionExecutionTime(async () => {
    // reload database with random data
    if (functionType === 'test_reload_database') {
      const normalUsers = query?.['normalUsers'] ? parseInt(query?.['normalUsers'] as string) : 10;
      const demoUsers = query?.['demoUsers'] ? parseInt(query?.['demoUsers'] as string) : 20;
      console.log('normalUsers', normalUsers);
      await test_reload_database_with_random_data(normalUsers, demoUsers);
    }

    // test function
    else if (functionType === 'test_function') {
      await test_function();
    } else if (functionType === 'test_delete_user_accounts') {
      await test_delete_user_accounts();
    } else if (functionType === 'run_scheduler_once_a_day') {
      await run_scheduler_once_a_day(req, res);
    } else if (functionType === 'run_scheduler_update_users') {
      await run_scheduler_update_users(req, res);
    } else if (functionType === 'run_outstanding_order_execute') {
      await outstandingOrdersExecuteAll();
    }
  });
});

// DEVELOPMENT ----------------------------
export const test_reload_database_with_random_data = async (normalUsers: number, demoUsers: number) => {
  console.log('[Database]: reload data');
  // delete and reload data for users and groups
  await testReloadDatabase(normalUsers, demoUsers);

  console.log('[Groups]: update portfolio');
  await groupUpdateData();

  console.log('[Users]: update rank');
  await userPortfolioRank();

  console.log('[Groups]: update rank');
  await groupPortfolioRank();

  console.log('[Users]: update hall of fame');
  await userHallOfFame();

  console.log('[Groups]: update hall of fame');
  await groupHallOfFame();

  console.log('[Hall Of fame]: modify data');
  await testingModifyHallOfFame();
};

const test_function = async () => {
  console.log('process.env.FUNCTIONS_EMULATOR ', process.env.FUNCTIONS_EMULATOR);
  console.log('process.env.FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);

  console.log('[Users]: update portfolio');
};

/** do not use in prod, probably not working correctly */
const test_delete_user_accounts = async () => {
  console.log('[Users]: deactivate necessary accounts');
  await userDeactivateInactiveAccounts();

  console.log('[Users]: delete demo or inactive accounts');
  await userDeleteDemoAccounts();

  console.log('[Users]: delete old inactive accounts');
  await userDeleteNormalAccounts();
};

// todo - remove this , deployed in admin seciton
export const userRecalculatePortfolioCall = onCall(
  {
    region: 'europe-central2',
    cors: ['http://localhost:4200/'],
  },
  async (request: CallableRequest<string>) => {
    const authUserId = request.auth?.uid;
    const userId = request.data;

    console.log(`Recalculate user portfolio state: ${userId}, by: ${authUserId}`);

    if (!authUserId || !userId) {
      console.error(`User not found: ${authUserId}`);
      return false;
    }

    const authUser = (await userDocumentRef(authUserId).get()).data();
    const user = (await userDocumentRef(userId).get()).data();

    if (!authUser || !user) {
      console.error(`User not found: ${authUserId}`);
      return false;
    }

    if (!authUser.isAdmin) {
      console.error(`User not authorized: ${authUserId}, name: ${authUser.personal.displayName}`);
      return false;
    }

    return recalculateUserPortfolioStateToUser(user);
  },
);
