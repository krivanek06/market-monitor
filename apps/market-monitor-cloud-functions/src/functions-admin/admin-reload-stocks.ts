import { getDatabaseStocksRef } from '@market-monitor/api-firebase';
import { StockSummary } from '@market-monitor/api-types';
import { Request, Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const adminReloadAllStocksWrapper = onRequest(
  { timeoutSeconds: 300 },
  async (request: Request, response: Response<string>) => {
    const databaseRef = getDatabaseStocksRef();
    const collections = await databaseRef.get();

    let counter = 0;
    console.log(`Updating ${collections.docs.length} documents`);

    // update all documents
    for await (const document of collections.docs) {
      try {
        if (counter % 10 === 0) {
          console.log(`Remaining: ${collections.docs.length - counter}}`);
        }

        // setting summary to reload
        document.ref.set(
          <StockSummary>{
            reloadData: true,
            reloadDetailsData: true,
          },
          { merge: true },
        );

        // increase counter
        counter++;
      } catch (error) {
        console.log(`Error with ${document.id}`);
        console.log(error);
      }
    }

    console.log('Done');
    response.send('Done');
  },
);
