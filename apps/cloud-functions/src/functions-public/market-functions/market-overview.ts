import {
  getEconomicData,
  getQuandlDataFormatter,
  getTreasuryYieldUS,
  postMarketOverview,
} from '@market-monitor/api-external';
import {
  ChartDataType,
  MARKET_OVERVIEW_ENDPOINTS,
  MarketOverview,
  MarketOverviewKey,
  MarketOverviewSubkeyReadable,
  marketOverviewLoadBonds,
  marketOverviewLoadGeneral,
  marketOverviewLoadSP500,
  marketOverviewLoadTreasury,
} from '@market-monitor/api-types';
import { Request, Response } from 'express';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const getMarketOverviewDataWrapper = async (request: Request, response: Response<ChartDataType | string>) => {
  // i.e: sp500
  const key = request.query.key as MarketOverviewKey;
  // i.e: peRatio
  const subKey = request.query.subKey as MarketOverviewSubkeyReadable<MarketOverviewKey>;

  // if information not provided send error to client
  if (!key || !subKey) {
    response.status(400);
    throw new Error('key or subkey to access data not provided');
  }

  try {
    const result = await loadMarketOverviewData(key, subKey);
    response.send(result);
  } catch (e) {
    console.log(e);
    response.status(500).send(`Unable to Provide data for key=${key}, subkey=${subKey}`);
  }
};

export const run_reload_market_overview = onSchedule(
  {
    timeoutSeconds: 200,
    schedule: '0 22 * * 5',
  },
  async (event) => {
    // reload data from api
    const loadedData = await reloadMarketOverview();

    // send data into cloudflare to save into KV
    await postMarketOverview(loadedData);

    // send notification to user
    console.log('function rungetmarketoverview finished successfully');
  },
);

const reloadMarketOverview = async (): Promise<MarketOverview> => {
  const waitingSeconds = 11;
  const datasetLimit = 150;
  const startTime = Date.now();

  const createOverviewDataBundle = async <T extends MarketOverviewKey, SubKeys extends MarketOverviewSubkeyReadable<T>>(
    key: T,
    subKeys: Array<SubKeys>,
  ): Promise<{ [K in SubKeys]: ChartDataType }> => {
    const marketOverviewDataTmp: Partial<{ [K in SubKeys]: ChartDataType }> = {};
    for await (const subKey of subKeys) {
      // load data from API
      const data = await loadMarketOverviewData(key, subKey);

      // limit data to show 3 years back
      const filteredData = data.slice(0, datasetLimit);

      // wait to target API again
      await delaySeconds(1);

      // push data into array
      marketOverviewDataTmp[subKey] = filteredData;
    }

    return marketOverviewDataTmp as { [K in SubKeys]: ChartDataType };
  };

  // load data from API, but wait N seconds between each call to avoid rate limit
  console.log('loading data for SP500');
  const sp500Data = await createOverviewDataBundle('sp500', marketOverviewLoadSP500);

  console.log('sp500 data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for bonds');
  const bondsData = await createOverviewDataBundle('bonds', marketOverviewLoadBonds);

  console.log('bonds data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for treasury');
  const treasuryData = await createOverviewDataBundle('treasury', marketOverviewLoadTreasury);

  console.log('treasury data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for general');
  const generalData = await createOverviewDataBundle('general', marketOverviewLoadGeneral);

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
    general: {
      ...generalData,
    },
  };

  // display how many seconds it took to load data
  const endTime = Date.now();
  const seconds = (endTime - startTime) / 1000;
  console.log(`loading data took ${seconds} seconds`);

  return marketOverview;
};

const loadMarketOverviewData = async <T extends MarketOverviewKey>(
  key: T,
  subKey: MarketOverviewSubkeyReadable<T>,
): Promise<ChartDataType> => {
  // get document and url from database: {qundal_treasury_yield_curve_rates_1_mo, USTREASURY/YIELD}
  const collection = MARKET_OVERVIEW_ENDPOINTS[key];
  if (!collection) {
    throw new Error(`Unable to find data for: [${key}] - [${subKey}]`);
  }

  // resolve endpoint
  if (collection.provider === 'financialmodelingprep') {
    const collectionData = collection.data.find((d) => d.keyReadable === subKey);
    return getEconomicData(collectionData.key);
  }

  if (collection.provider === 'quandl') {
    // check if provided key is treasury
    if (collection.name === 'Treasury') {
      const treasury = await getTreasuryYieldUS();
      const index = collection.data.findIndex((d) => d.keyReadable === subKey);
      const selectedData = treasury.map((d) => [d[0], d[index + 1] ?? 0]) as [string, number][] satisfies ChartDataType;
      return selectedData;
    }

    // TODO: some TS stupidity here, need to fix
    // TODO: error:  has signatures, but none of those signatures are compatible with each other.
    if (collection.name === 'Bonds') {
      const collectionData = collection.data.find((d) => d.keyReadable === subKey);
      return getQuandlDataFormatter(collectionData.key);
    }
    if (collection.name === 'Bitcoin') {
      const collectionData = collection.data.find((d) => d.keyReadable === subKey);
      return getQuandlDataFormatter(collectionData.key);
    }

    if (collection.name === 'S&P 500') {
      const collectionData = collection.data.find((d) => d.keyReadable === subKey);
      return getQuandlDataFormatter(collectionData.key);
    }
  }
};

const delaySeconds = (seconds: number) => new Promise((res) => setTimeout(res, seconds * 1000));
