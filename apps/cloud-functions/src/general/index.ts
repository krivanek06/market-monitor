import { corsMiddleWareHttp, firebaseSimpleErrorLogger, isFirebaseEmulator } from '../utils';
import { reloadDatabase } from './reload-database';

export * from './app-test';

// DEVELOPMENT ----------------------------

export const test_me = firebaseSimpleErrorLogger(
  'test_function',
  corsMiddleWareHttp(async (request, response) => {
    if (!isFirebaseEmulator()) {
      console.warn('Function can be executed only in development mode');
      return;
    }

    console.log('--- start ---');

    await reloadDatabase();

    console.log('--- finished ---');
  }),
);
