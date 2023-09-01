import { getQuandlDataFormatter, getTreasuryYieldUS } from '@market-monitor/api-external';
import {
  MARKET_OVERVIEW_DATABASE_ENDPOINTS,
  MarketOverview,
  MarketOverviewData,
  MarketOverviewDatabaseKeys,
  marketOverviewToLoad,
} from '@market-monitor/api-types';
import { delaySeconds } from '@market-monitor/shared-utils-general';
import { Request, Response } from 'express';
import { warn } from 'firebase-functions/logger';

export const getMarketOverviewDataWrapper = async (request: Request, response: Response<MarketOverviewData | null>) => {
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
};

export const reload_market_overview = async (request: Request, response: Response<MarketOverview | null>) => {
  // reload data from api
  const loadedData = await reloadMarketOverview();

  // return data
  response.send(loadedData);

  // send notification to user
  console.log('function rungetmarketoverview finished successfully');
};

const reloadMarketOverview = async (): Promise<MarketOverview> => {
  const waitingSeconds = 12;
  const datasetLimit = 100;

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

const loadMarketOverviewData = async (
  key: MarketOverviewDatabaseKeys,
  subKey: string,
  hardReload = false,
  waitSeconds = 0,
): Promise<MarketOverviewData> => {
  await delaySeconds(waitSeconds);

  // get document and url from database: {qundal_treasury_yield_curve_rates_1_mo, USTREASURY/YIELD}
  const { document, url } = MARKET_OVERVIEW_DATABASE_ENDPOINTS[key].data?.[subKey];
  console.log(key, subKey, document, url);

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
