import { Request, Response } from 'express';
import { error } from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';

export const firebaseSimpleErrorLogger = (
  // We pass an identifying ‘name’ as a string
  // This will show up in our Sentry error titles
  // so it needs to a) be unique and b) make sense
  name: string,

  // This is the handler itself, which previously
  // you would have exported directly from the
  // function file
  handler: (request: Request, response: Response<any>) => any | Promise<any>,
) => {
  return onRequest(async (request: Request, response: Response<any>) => {
    try {
      // 3. Try calling the function handler itself
      await handler(request, response);
    } catch (e) {
      // log error
      error(e);

      // send error to client
      response.status(500).send(`Internal Server Error`);

      // Don’t forget to throw them too!
      throw e;
    }
  });
};

export const isFirebaseEmulator = () => {
  console.log('process.env.FUNCTIONS_EMULATOR ', process.env.FUNCTIONS_EMULATOR);
  console.log('process.env.FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);
  return process.env.FUNCTIONS_EMULATOR === 'true' && process.env.FIRESTORE_EMULATOR_HOST === '127.0.0.1:8080';
};
