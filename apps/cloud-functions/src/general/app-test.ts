import { Request, Response } from 'express';
import { corsMiddleWareHttp, firebaseSimpleErrorLogger, isFirebaseEmulator } from '../utils';

export const test_runner = firebaseSimpleErrorLogger(
  'test_runner',
  corsMiddleWareHttp((request: Request, response: Response<string>) => {
    console.log('process.env.FUNCTIONS_EMULATOR ', process.env.FUNCTIONS_EMULATOR);
    console.log('process.env.FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);
    response.send(`Is development mode on: ${isFirebaseEmulator()}`);
  }),
);
