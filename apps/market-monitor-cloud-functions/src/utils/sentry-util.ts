import { GCPFunction, captureException, configureScope, flush, setContext, startTransaction } from '@sentry/serverless';
import { Request, Response } from 'express';
import { https } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';

export const sentryHttpsOnCallWrapper = (
  // We pass an identifying ‘name’ as a string
  // This will show up in our Sentry error titles
  // so it needs to a) be unique and b) make sense
  name: string,

  // This is the handler itself, which previously
  // you would have exported directly from the
  // function file
  handler: (data: any, context: https.CallableContext) => any | Promise<any>,
) => {
  return async (data: any, context: https.CallableContext) => {
    // 1. Start the Sentry transaction
    const transaction = startTransaction({
      name,
      op: 'functions.https.onCall',
    });

    // 2. Set the transaction context
    // In this example, we’re sending the uid from Firebase auth
    // You can send any relevant data here that might help with
    // debugging
    setContext('Function context', {
      ...(data || {}),
      uid: context.auth?.uid,
      function: name,
      op: 'functions.https.onCall',
    });

    try {
      // 3. Try calling the function handler itself
      return await handler(data, context);
    } catch (e) {
      // 4. Send any errors to Sentry
      await captureException(e);
      await flush(1000);

      // Don’t forget to throw them too!

      throw e;
    } finally {
      // 5. Finish the Sentry transaction
      configureScope((scope) => scope.clear());
      transaction.finish();
    }
  };
};

export const sentryHttpsOnRequestWrapper = (
  // We pass an identifying ‘name’ as a string
  // This will show up in our Sentry error titles
  // so it needs to a) be unique and b) make sense
  name: string,

  // This is the handler itself, which previously
  // you would have exported directly from the
  // function file
  handler: (request: Request, response: Response<any>) => any | Promise<any>,
) => {
  return onRequest(
    GCPFunction.wrapHttpFunction(async (request: Request, response: Response<any>) => {
      // 1. Start the Sentry transaction
      const transaction = startTransaction({
        name,
        op: 'functions.https.onRequest',
      });

      // 2. Set the transaction context
      // In this example, we’re sending the uid from Firebase auth
      // You can send any relevant data here that might help with
      // debugging
      setContext('Function context', {
        function: name,
        op: 'functions.https.onCall',
      });

      try {
        // 3. Try calling the function handler itself
        await handler(request, response);
      } catch (e) {
        // 4. Send any errors to Sentry
        await captureException(e);
        await flush(1000);

        // send error to client
        response.status(500).send(`Internal Server Error`);

        // Don’t forget to throw them too!
        throw e;
      } finally {
        // 5. Finish the Sentry transaction
        configureScope((scope) => scope.clear());
        transaction.finish();
      }
    }),
  );
};
