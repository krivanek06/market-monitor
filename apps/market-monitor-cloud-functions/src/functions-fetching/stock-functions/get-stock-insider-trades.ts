import { getInsiderTrading } from '@market-monitor/api-external';
import { getDatabaseStockInsiderTradingRef } from '@market-monitor/api-firebase';
import { CompanyInsideTrade } from '@market-monitor/api-types';
import { checkDataValidity } from '@market-monitor/shared-utils-general';
import { Request, Response } from 'express';

export const getStockInsiderTradesWrapper = async (request: Request, response: Response<CompanyInsideTrade[]>) => {
  const symbol = request.query.symbol as string;

  // throw error if no symbols
  if (!symbol) {
    response.send([]);
    return;
  }

  const databaseRef = getDatabaseStockInsiderTradingRef(symbol);
  const databaseData = (await databaseRef.get()).data();

  // no need for reload
  if (!checkDataValidity(databaseData)) {
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
};
