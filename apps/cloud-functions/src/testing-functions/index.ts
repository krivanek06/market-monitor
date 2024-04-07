import { onRequest } from 'firebase-functions/v2/https';
import { isFirebaseEmulator } from '../utils';
import { test_runner } from './app-test';
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

export const test_function = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  if (!isFirebaseEmulator()) {
    console.warn('Function can be executed only in development mode');
    return;
  }
  const startTime = performance.now();
  console.log('--- start ---');

  await test_runner();

  console.log('--- finished ---');

  const endTime = performance.now();
  const secondsDiff = Math.round((endTime - startTime) / 1000);
  console.log(`Function took: ~${secondsDiff} seconds`);

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
