import { getSymbolOwnershipInstitutional } from '@market-monitor/api-external';
import { getDatabaseStockOwnershipInstitutionalRef } from '@market-monitor/api-firebase';
import { SymbolOwnershipInstitutional } from '@market-monitor/api-types';
import { isBefore, subDays } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getownershipinstitutional = onRequest(
  async (request, response: Response<SymbolOwnershipInstitutional[]>) => {
    const symbolString = request.query.symbol as string | undefined;

    // throw error if no symbol or date
    if (!symbolString) {
      response.send([]);
      return;
    }

    // check data in DB
    const databaseRef = getDatabaseStockOwnershipInstitutionalRef(symbolString);
    const databaseData = (await databaseRef.get()).data();

    // check if the provided data is not older than 7 days
    const reloadData = databaseData && isBefore(new Date(databaseData.lastUpdate), subDays(new Date(), 7));

    // no need for reload
    if (!reloadData) {
      response.send(databaseData.data);
      return;
    }

    // reload data
    const data = await getSymbolOwnershipInstitutional(symbolString);
    databaseRef.set({
      data,
      lastUpdate: new Date().toISOString(),
    });

    // send to user
    response.send(data);
  }
);
