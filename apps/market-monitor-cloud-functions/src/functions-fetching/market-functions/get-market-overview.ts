import { getDatabaseMarketOverviewRef } from '@market-monitor/api-firebase';
import { MarketOverview, MarketOverviewData, MarketOverviewDatabaseKeys } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { loadMarketOverviewData } from '../../functions-shared';

/**
 * Get market overview data from database, data always exists in database
 */
export const getmarketoverview = onRequest(async (_, response: Response<MarketOverview>) => {
  const marketOverviewRef = getDatabaseMarketOverviewRef();
  const marketOverviewData = (await marketOverviewRef.get()).data();

  // send data to user
  response.send(marketOverviewData);
});

export const getmarketoverviewdata = onRequest(async (request, response: Response<MarketOverviewData | null>) => {
  // i.e: sp500
  const key = request.query.key as MarketOverviewDatabaseKeys;
  // i.e: peRatio
  const subKey = request.query.subKey as string;
  // whether to reload data from api or not
  const hardReload = request.query.hardReload as string;

  // if information not provided send error to client
  if (!key || !subKey) {
    response.status(400);
    throw new Error('key or subkey to access data not provided');
  }

  const result = await loadMarketOverviewData(key, subKey, hardReload === 'true');

  response.send(result);
});
