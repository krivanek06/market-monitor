import { getQuandlDataGeneric } from '@market-monitor/api-external';
import { getDatabaseMarketOverviewRef } from '@market-monitor/api-firebase';
import { MARKET_OVERVIEW_DATA, MarketOverviewData } from '@market-monitor/api-types';
import { Response } from 'express';
/**
 * load data from quandl api
 * - format the data
 * - save into firebase
 * load data from financial modeling prep api
 * - format the data
 * - save into firebase
 *
 * later: create an api to load a spacific market data
 */

import { onRequest } from 'firebase-functions/v2/https';

export const getmarketoverview = onRequest(async (request, response: Response<MarketOverviewData | null>) => {
  const key = request.query.key as string;
  const databaseKey = request.query.document as string;

  // get path from json
  const block = MARKET_OVERVIEW_DATA.find((d) => d.key === key)?.data?.find((d) => d.databaseKey === databaseKey);

  if (!block) {
    console.log(`no block found for key: [${key}] - [${databaseKey}]`);
    response.send(null);
    return;
  }

  const marketOverviewRef = getDatabaseMarketOverviewRef(block.databaseKey);
  const marketOverviewData = (await marketOverviewRef.get()).data();

  // return data if exists
  if (marketOverviewData) {
    response.send(marketOverviewData);
    return;
  }
});

const resolveAPIEndpoint = (provider: string, endpoint: string): Promise<MarketOverviewData> => {
  if (provider === 'quandl') {
    return getQuandlDataGeneric(endpoint);
  }

  throw new Error(`provider [${provider}] not supported`);
};

const resolveAPIEndpointQuandl = async (endpoint: string): Promise<MarketOverviewData> => {
  const data = await getQuandlDataGeneric(endpoint);
  return {
    name: data.name,
    description: data.description,
    end_date: data.end_date,
    start_date: data.start_date,
    lastUpdate: new Date().toISOString(),
    frequency: data.frequency,
    data: data.data.map((d) => [d[0], d[1]]),
  };
};
