import { onRequest } from 'firebase-functions/v2/https';
import { isFirebaseEmulator } from '../utils';
import { reloadDatabase } from './reload-database';
import { runALlSchedulers } from './run-all-schedullers';

export * from './app-test';

// DEVELOPMENT ----------------------------
export const test_reload_database = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  if (!isFirebaseEmulator()) {
    console.warn('Function can be executed only in development mode');
    return;
  }

  console.log('--- start ---');

  await reloadDatabase();

  console.log('--- finished ---');
  res.send('ok');
});

export const test_run_all_schedulers = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  if (!isFirebaseEmulator()) {
    console.warn('Function can be executed only in development mode');
    return;
  }

  console.log('--- start ---');

  await runALlSchedulers();

  console.log('--- finished ---');
  res.send('ok');
});
