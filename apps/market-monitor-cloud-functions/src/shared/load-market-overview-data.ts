import { getQuandlDataFormatter, getTreasuryYieldUS } from '@market-monitor/api-external';
import { getDatabaseMarketOverviewDataRef } from '@market-monitor/api-firebase';
import {
  MARKET_OVERVIEW_DATABASE_ENDPOINTS,
  MarketOverviewData,
  MarketOverviewDatabaseKeys,
} from '@market-monitor/api-types';
import { delaySeconds } from '@market-monitor/shared-utils-general';

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

import { firestore } from 'firebase-admin';
import { warn } from 'firebase-functions/logger';

// TODO: update data if older than 7 days
export const loadMarketOverviewData = async (
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

  // get data from firebase
  const marketOverviewRef = getDatabaseMarketOverviewDataRef(document);
  const marketOverviewData = (await marketOverviewRef.get()).data();

  // return data if exists
  if (marketOverviewData && !hardReload) {
    return marketOverviewData;
  }

  // resolve endpoint
  // console.log(`API call for ${key} - ${subKey}`);
  const apiData = await loadDataFromEndpoint(subKey, url);

  // save data to DB
  if (!(apiData instanceof Array)) {
    await updateSingleDocuments(document, apiData);
    return apiData;
  }

  // get document keys to save multiple data into firestore
  const documentsToSave = getDocumentsToSaveData(key, url);

  // check if we have the same amount of documents to save as api data
  if (documentsToSave.length !== apiData.length) {
    warn(`documentsToSave.length !== apiData.length for ${key} - ${subKey}`);
  }

  // save api data per document
  await updateMultipleDocuments(documentsToSave, apiData);

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
 *
 * @param document i.e: qundal_treasury_yield_curve_rates_1_mo
 * @param url: USTREASURY/YIELD
 */
const updateSingleDocuments = async (document: string, marketOverview: MarketOverviewData) => {
  const documentRef = getDatabaseMarketOverviewDataRef(document);
  await documentRef.set(marketOverview);
};

/**
 *
 * @param document i.e: qundal_treasury_yield_curve_rates_1_mo
 * @param url: USTREASURY/YIELD
 */
const updateMultipleDocuments = async (documents: string[], marketOverview: MarketOverviewData[]) => {
  const batch = firestore().batch();
  for (let index = 0; index < documents.length; index++) {
    const document = documents[index];
    const data = marketOverview[index];
    const documentRef = getDatabaseMarketOverviewDataRef(document);

    // add data to batch
    batch.set(documentRef, data);
  }
  await batch.commit();
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
