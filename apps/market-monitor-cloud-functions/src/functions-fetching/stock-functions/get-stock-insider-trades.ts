import { getInsiderTrading } from '@market-monitor/api-external';
import { getDatabaseStockInsiderTradingRef } from '@market-monitor/api-firebase';
import { CompanyInsideTrade } from '@market-monitor/api-types';
import { isBefore, subDays } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getstockinsidertrades = onRequest(async (request, response: Response<CompanyInsideTrade[]>) => {
  const symbol = request.query.symbol as string;

  // throw error if no symbols
  if (!symbol) {
    response.send([]);
    return;
  }

  const databaseRef = getDatabaseStockInsiderTradingRef(symbol);
  const databaseData = (await databaseRef.get()).data();

  // check if the provided data is not older than 7 days
  const reloadData = !databaseData || isBefore(new Date(databaseData.lastUpdate), subDays(new Date(), 7));

  // no need for reload
  if (!reloadData) {
    response.send(databaseData.data);
    return;
  }

  // reload data
  const [page0, page1, page2] = await Promise.all([
    getInsiderTrading(symbol, 0),
    getInsiderTrading(symbol, 1),
    getInsiderTrading(symbol, 2),
  ]);

  const data = [...page0, ...page1, ...page2];

  // save to DB
  databaseRef.set({
    data,
    lastUpdate: new Date().toISOString(),
  });

  // send to user
  response.send(data);
});
