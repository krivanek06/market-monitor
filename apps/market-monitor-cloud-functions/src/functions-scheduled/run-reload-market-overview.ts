import { getDatabaseMarketOverviewRef } from '@market-monitor/api-firebase';
import { MarketOverview, MarketOverviewData, marketOverviewToLoad } from '@market-monitor/api-types';
import { delaySeconds } from '@market-monitor/shared-utils-general';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { loadMarketOverviewData } from '../shared';

/**
 * each week At 22:00 on Friday.”
 */
export const run_reload_market_overview = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 22 * * 5',
  },
  async (event) => {
    const marketOverviewRef = getDatabaseMarketOverviewRef();
    const marketOverviewData = (await marketOverviewRef.get()).data();

    // reload data from api
    const loadedData = await reloadMarketOverview(marketOverviewData);

    // save, but keep old data if fails
    await marketOverviewRef.set(loadedData, { merge: true });

    // send notification to user
    console.log('function rungetmarketoverview finished successfully');
  },
);

const reloadMarketOverview = async (oldMarketOverview?: MarketOverview): Promise<MarketOverview> => {
  const waitingSeconds = 12;
  const datasetLimit = 75;

  // helper function to create correct data format
  const dataFormatter = <T extends keyof MarketOverview>(data: MarketOverviewData[], mainKey: T) => {
    return data.reduce(
      (acc, cur, index) => {
        // create new data if exists or use old data - API can return null values if fails
        const overview: MarketOverviewData = cur
          ? { ...cur, data: cur.data.slice(0, datasetLimit), dates: cur.dates.slice(0, datasetLimit) }
          : oldMarketOverview[mainKey][oldMarketOverview[mainKey][index]] ?? null;
        return { ...acc, [marketOverviewToLoad[mainKey][index]]: overview };
      },
      {} as { [K in keyof MarketOverview[T]]: MarketOverviewData },
    );
  };

  // create function to generate random number between 0 and 15
  const randomWait = () => Math.floor(Math.random() * 16);

  // load data from API, but wait N seconds between each call to avoid rate limit
  console.log('loading data for SP500');
  const sp500Data = dataFormatter(
    await Promise.all(
      marketOverviewToLoad.sp500.map((subKey) => loadMarketOverviewData('sp500', subKey, true, randomWait())),
    ),
    'sp500',
  );
  console.log('sp500 data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for bonds');
  const bondsData = dataFormatter(
    await Promise.all(
      marketOverviewToLoad.bonds.map((subKey) => loadMarketOverviewData('bonds', subKey, true, randomWait())),
    ),
    'bonds',
  );
  console.log('bonds data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for treasury');
  const treasuryData = dataFormatter(
    await Promise.all(
      marketOverviewToLoad.treasury.map((subKey) => loadMarketOverviewData('treasury', subKey, true, randomWait())),
    ),
    'treasury',
  );
  console.log('treasury data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for inflationRate');
  const inflationRateData = dataFormatter(
    await Promise.all(
      marketOverviewToLoad.inflationRate.map((subKey) =>
        loadMarketOverviewData('inflationRate', subKey, true, randomWait()),
      ),
    ),
    'inflationRate',
  );
  console.log('inflationRate data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for consumerIndex');
  const consumerIndexData = dataFormatter(
    await Promise.all(
      marketOverviewToLoad.consumerIndex.map((subKey) =>
        loadMarketOverviewData('consumerIndex', subKey, true, randomWait()),
      ),
    ),
    'consumerIndex',
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
