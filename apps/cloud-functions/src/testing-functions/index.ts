import { onRequest } from 'firebase-functions/v2/https';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from '../group';
import {
  userDeactivateInactiveAccounts,
  userDeleteDemoAccounts,
  userDeleteNormalAccounts,
  userHallOfFame,
  userPortfolioRank,
  userPortfolioUpdate,
} from '../user';
import { runFunctionInEmulator } from './../utils';
import { reloadDatabase } from './reload-database';

// DEVELOPMENT ----------------------------
export const test_reload_database = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    // delete and reload data for users and groups
    await reloadDatabase();

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

    res.send('ok');
  });
});

export const test_function = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    console.log('process.env.FUNCTIONS_EMULATOR ', process.env.FUNCTIONS_EMULATOR);
    console.log('process.env.FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);

    console.log('[Users]: update portfolio');

    res.send('ok');
  });
});

export const test_run_all_schedulers = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    // run all schedulers
    console.log('[Users]: update portfolio');
    await userPortfolioUpdate();
    console.log('[Groups]: update portfolio');
    await groupUpdateData();
    console.log('[Users]: update rank');
    await userPortfolioRank();
    console.log('[Users]: update hall of fame');
    await userHallOfFame();
    console.log('[Groups]: update rank');
    await groupPortfolioRank();
    console.log('[Groups]: update hall of fame');
    await groupHallOfFame();

    res.send('ok');
  });
});

export const test_delete_user_accounts = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    console.log('[Users]: deactivate necessary accounts');
    await userDeactivateInactiveAccounts();

    console.log('[Users]: delete demo or inactive accounts');
    await userDeleteDemoAccounts();

    console.log('[Users]: delete old inactive accounts');
    await userDeleteNormalAccounts();

    res.send('ok');
  });
});
