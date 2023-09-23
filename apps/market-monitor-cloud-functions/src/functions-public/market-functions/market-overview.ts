import { getQuandlDataFormatter, getTreasuryYieldUS, postMarketOverview } from '@market-monitor/api-external';
import {
  MARKET_OVERVIEW_DATABASE_ENDPOINTS,
  MarketOverview,
  MarketOverviewData,
  MarketOverviewDatabaseKeys,
  marketOverviewToLoad,
} from '@market-monitor/api-types';
import { isBefore, subYears } from 'date-fns';
import { Request, Response } from 'express';
import { warn } from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const getMarketOverviewDataWrapper = async (request: Request, response: Response<MarketOverviewData | null>) => {
  // i.e: sp500
  const key = request.query.key as MarketOverviewDatabaseKeys;
  // i.e: peRatio
  const subKey = request.query.subKey as string;

  // if information not provided send error to client
  if (!key || !subKey) {
    response.status(400);
    throw new Error('key or subkey to access data not provided');
  }

  const result = await loadMarketOverviewData(key, subKey);

  response.send(result);
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
  const datasetLimit = 100;
  const startTime = Date.now();

  // helper function to create correct data format
  const dataFormatter = <T extends keyof MarketOverview>(data: MarketOverviewData[], mainKey: T) => {
    return data.reduce(
      (acc, cur, index) => {
        const overview: MarketOverviewData = {
          ...cur,
          data: cur.data.slice(0, datasetLimit),
          dates: cur.dates.slice(0, datasetLimit),
        };
        return { ...acc, [marketOverviewToLoad[mainKey][index]]: overview };
      },
      {} as { [K in keyof MarketOverview[T]]: MarketOverviewData },
    );
  };

  const createOverviewDataBundle = async (key: MarketOverviewDatabaseKeys): Promise<MarketOverviewData[]> => {
    let marketOverviewDataTmp: MarketOverviewData[] = [];
    for await (const subKey of marketOverviewToLoad[key]) {
      // load data from API
      const data = await loadMarketOverviewData(key, subKey);
      // limit data to show 3 years back
      const index = data.dates.findIndex((date) => isBefore(new Date(date), subYears(new Date(), 3)));
      // create new data
      const formattedData = {
        ...data,
        dates: data.dates.slice(index),
        data: data.data.slice(index),
      } satisfies MarketOverviewData;
      // wait to target API again
      await delaySeconds(1);
      // push data into array
      marketOverviewDataTmp.push(formattedData);
    }

    return marketOverviewDataTmp;
  };

  // load data from API, but wait N seconds between each call to avoid rate limit
  console.log('loading data for SP500');
  const sp500Data = dataFormatter(await createOverviewDataBundle('sp500'), 'sp500');

  console.log('sp500 data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for bonds');
  const bondsData = dataFormatter(await createOverviewDataBundle('bonds'), 'bonds');

  console.log('bonds data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for treasury');
  const treasuryData = dataFormatter(await createOverviewDataBundle('treasury'), 'treasury');

  console.log('treasury data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for inflationRate');
  const inflationRateData = dataFormatter(await createOverviewDataBundle('inflationRate'), 'inflationRate');

  console.log('inflationRate data loaded');
  console.log(`waiting ${waitingSeconds} seconds finished`);
  await delaySeconds(waitingSeconds);

  console.log('loading data for consumerIndex');
  const consumerIndexData = dataFormatter(await createOverviewDataBundle('consumerIndex'), 'consumerIndex');

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

  // display how many seconds it took to load data
  const endTime = Date.now();
  const seconds = (endTime - startTime) / 1000;
  console.log(`loading data took ${seconds} seconds`);

  return marketOverview;
};

const loadMarketOverviewData = async (key: MarketOverviewDatabaseKeys, subKey: string): Promise<MarketOverviewData> => {
  // get document and url from database: {qundal_treasury_yield_curve_rates_1_mo, USTREASURY/YIELD}
  const { document, url } = MARKET_OVERVIEW_DATABASE_ENDPOINTS[key].data?.[subKey];

  if (!document || !url) {
    console.log(`no firebaseDocument found for key: [${key}] - [${document}]`);
    throw new Error(`no firebaseDocument found for key: [${key}] - [${document}]`);
  }

  // resolve endpoint
  // console.log(`API call for ${key} - ${subKey}`);
  const apiData = await loadDataFromEndpoint(subKey, url);

  // save data to DB
  if (!(apiData instanceof Array)) {
    return apiData;
  }

  // get document keys to save multiple data into firestore
  const documentsToSave = getDocumentsToSaveData(key, url);

  // check if we have the same amount of documents to save as api data
  if (documentsToSave.length !== apiData.length) {
    warn(`documentsToSave.length !== apiData.length for ${key} - ${subKey}`);
  }

  // find the requested document and return it
  const indexToReturn = documentsToSave.findIndex((d) => d === document);
  const data = apiData[indexToReturn];
  return data;
};

const loadDataFromEndpoint = (
  subkey: string, // i.e: peRatio
  url: string, // i.e: MULTPL/SP500_PE_RATIO_MONTH
): Promise<MarketOverviewData | MarketOverviewData[]> => {
  // check if provided key is treasury
  if (subkey in MARKET_OVERVIEW_DATABASE_ENDPOINTS.treasury) {
    return getTreasuryYieldUS();
  }

  return getQuandlDataFormatter(url);
};

/**
 * from MARKET_OVERVIEW_DATABASE_KEYS will return an array of documents that
 * have the same url.
 * Example is `treasury` we get multiple data from the same url,
 * but we want to save them in different documents.
 */
const getDocumentsToSaveData = (key: MarketOverviewDatabaseKeys, url: string): string[] => {
  return Object.keys(MARKET_OVERVIEW_DATABASE_ENDPOINTS[key])
    .filter((subKey) => MARKET_OVERVIEW_DATABASE_ENDPOINTS[key][subKey].url === url)
    .map((subKey) => MARKET_OVERVIEW_DATABASE_ENDPOINTS[key][subKey].document);
};

const delaySeconds = (seconds: number) => new Promise((res) => setTimeout(res, seconds * 1000));
