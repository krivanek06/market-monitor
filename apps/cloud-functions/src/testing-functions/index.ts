import { onRequest } from 'firebase-functions/v2/https';
import { runFunctionInEmulator } from './../utils';
import { reloadDatabase } from './reload-database';
import { runALlSchedulers } from './run-all-schedullers';

// DEVELOPMENT ----------------------------
export const test_reload_database = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(reloadDatabase);
  res.send('ok');
});

export const test_function = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    console.log('process.env.FUNCTIONS_EMULATOR ', process.env.FUNCTIONS_EMULATOR);
    console.log('process.env.FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);

    console.log('[Users]: update portfolio');
  });

  res.send('ok');
});

export const test_run_all_schedulers = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(runALlSchedulers);
  res.send('ok');
});
