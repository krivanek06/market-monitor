import { getSymbolOwnershipHolders } from '@market-monitor/api-external';
import { getDatabaseStockOwnershipHoldersRef } from '@market-monitor/api-firebase';
import { SymbolOwnershipHolders } from '@market-monitor/api-types';
import { isDateValidQuarter } from '@market-monitor/shared-utils-general';
import { isBefore, subDays } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getownershipholderstodate = onRequest(async (request, response: Response<SymbolOwnershipHolders[]>) => {
  const symbolString = request.query.symbol as string | undefined;
  const dateQuarter = request.query.date as string | undefined;

  // throw error if no symbol or date
  if (!symbolString || !dateQuarter) {
    response.send([]);
    return;
  }

  // check if date is valid quarter
  if (!isDateValidQuarter(dateQuarter)) {
    response.send([]);
    return;
  }

  // check data in DB
  const databaseRef = getDatabaseStockOwnershipHoldersRef(symbolString, dateQuarter);
  const databaseData = (await databaseRef.get()).data();

  // check if the provided data is not older than 7 days
  const reloadData = !databaseData || isBefore(new Date(databaseData.lastUpdate), subDays(new Date(), 7));

  // return data if exists
  if (!reloadData) {
    response.send(databaseData.data);
    return;
  }

  // reload data
  const data = await getSymbolOwnershipHolders(symbolString, dateQuarter);
  databaseRef.set({
    data,
    lastUpdate: new Date().toISOString(),
  });
  response.send(data);
});
