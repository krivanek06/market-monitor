import { getDatabaseMarketOverviewRef } from '@market-monitor/api-firebase';
import { MarketOverview, MarketOverviewData, marketOverviewToLoad } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { loadMarketOverviewData } from '../../functions-shared';
import { delaySeconds } from '../../utils';

export const rungetmarketoverview = onRequest(async (_, response: Response<string>) => {
  const marketOverviewRef = getDatabaseMarketOverviewRef();
  const marketOverviewData = (await marketOverviewRef.get()).data();

  // reload data from api
  const loadedData = await reloadMarketOverview(marketOverviewData);

  // save, but keep old data if fails
  await marketOverviewRef.set(loadedData, { merge: true });

  // send notification to user
  response.send('function rungetmarketoverview finished');
});

const reloadMarketOverview = async (oldMarketOverview?: MarketOverview): Promise<MarketOverview> => {
  const waitingSeconds = 10;
  const datasetLimit = 2;

  // helper function to create correct data format
  const dataFormatter = <T extends keyof MarketOverview>(data: MarketOverviewData[], mainKey: T) => {
    return data.reduce((acc, cur, index) => {
      // create new data if exists or use old data - API can return null values if fails
      const overview: MarketOverviewData = cur
        ? { ...cur, data: cur.data.slice(0, datasetLimit) }
        : oldMarketOverview[mainKey][oldMarketOverview[mainKey][index]] ?? null;
      return { ...acc, [marketOverviewToLoad[mainKey][index]]: overview };
    }, {} as { [K in keyof MarketOverview[T]]: MarketOverviewData });
  };

  // load data from API, but wait N seconds between each call to avoid rate limit
  const sp500Data = dataFormatter(
    await Promise.all(marketOverviewToLoad.sp500.map((subKey) => loadMarketOverviewData('sp500', subKey))),
    'sp500'
  );
  console.log('sp500 data loaded');
  await delaySeconds(waitingSeconds);
  console.log(`waiting ${waitingSeconds} seconds finished`);

  const bondsData = dataFormatter(
    await Promise.all(marketOverviewToLoad.bonds.map((subKey) => loadMarketOverviewData('bonds', subKey))),
    'bonds'
  );

  console.log('bonds data loaded');
  await delaySeconds(waitingSeconds);
  console.log(`waiting ${waitingSeconds} seconds finished`);

  const treasuryData = dataFormatter(
    await Promise.all(marketOverviewToLoad.treasury.map((subKey) => loadMarketOverviewData('treasury', subKey))),
    'treasury'
  );

  console.log('treasury data loaded');
  await delaySeconds(waitingSeconds);
  console.log(`waiting ${waitingSeconds} seconds finished`);

  const inflationRateData = dataFormatter(
    await Promise.all(
      marketOverviewToLoad.inflationRate.map((subKey) => loadMarketOverviewData('inflationRate', subKey))
    ),
    'inflationRate'
  );

  console.log('inflationRate data loaded');
  await delaySeconds(waitingSeconds);
  console.log(`waiting ${waitingSeconds} seconds finished`);

  const consumerIndexData = dataFormatter(
    await Promise.all(
      marketOverviewToLoad.consumerIndex.map((subKey) => loadMarketOverviewData('consumerIndex', subKey))
    ),
    'consumerIndex'
  );

  console.log('consumerIndex data loaded');

  const marketOverview: MarketOverview = {
    sp500: {
      ...sp500Data,
    },
    bonds: {
      ...bondsData,
    },
    treasury: {
      ...treasuryData,
    },
    inflationRate: {
      ...inflationRateData,
    },
    consumerIndex: {
      ...consumerIndexData,
    },
  };

  return marketOverview;
};
