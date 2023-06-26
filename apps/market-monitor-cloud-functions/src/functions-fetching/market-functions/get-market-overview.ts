import { getQuandlDataFormatter, getTreasuryYieldUS } from '@market-monitor/api-external';
import { MARKET_OVERVIEW_DATABASE_KEYS, getDatabaseMarketOverviewRef } from '@market-monitor/api-firebase';
import { MarketOverviewData } from '@market-monitor/api-types';
import { Response } from 'express';
import { zip } from 'lodash';

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
import { onRequest } from 'firebase-functions/v2/https';

export const getmarketoverviewdata = onRequest(async (request, response: Response<MarketOverviewData | null | any>) => {
  // i.e: sp500
  const key = request.query.key as keyof typeof MARKET_OVERVIEW_DATABASE_KEYS;
  // i.e: peRatio
  const subKey = request.query.document as string;
  // whether to reload data from api or not
  const hardReload = request.query.hardReload as string;

  // get document and url from database: {qundal_treasury_yield_curve_rates_1_mo, USTREASURY/YIELD}
  const { document, url } = MARKET_OVERVIEW_DATABASE_KEYS[key]?.[subKey] as { document: string; url: string };
  console.log(key, subKey, document, url);

  if (!document || !url) {
    console.log(`no firebaseDocument found for key: [${key}] - [${document}]`);
    response.send(null);
    return;
  }

  // get data from firebase
  const marketOverviewRef = getDatabaseMarketOverviewRef(document);
  const marketOverviewData = (await marketOverviewRef.get()).data();

  // TODO Update data

  // return data if exists
  if (marketOverviewData && hardReload !== 'true') {
    response.send(marketOverviewData);
    return;
  }

  // resolve endpoint
  const apiData = await loadDataFromEndpoint(subKey, url);

  // save data to DB
  if (!(apiData instanceof Array)) {
    await updateSingleDocuments(document, apiData);
    response.send(apiData);
    return;
  }

  // get document keys to save multiple data into firestore
  const documentsToSave = getDocumentsToSaveData(key, url);

  // save api data per document
  await updateMultipleDocuments(documentsToSave, apiData);

  // find the requested document and return it
  const indexToReturn = documentsToSave.findIndex((d) => d === document);
  const data = apiData[indexToReturn];
  response.send(data);
});

const loadDataFromEndpoint = (
  subkey: string, // i.e: peRatio
  url: string // i.e: MULTPL/SP500_PE_RATIO_MONTH
): Promise<MarketOverviewData | MarketOverviewData[]> => {
  // check if provided key is treasury
  if (subkey in MARKET_OVERVIEW_DATABASE_KEYS.treasury) {
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
  const documentRef = getDatabaseMarketOverviewRef(document);
  await documentRef.set(marketOverview);
};

/**
 *
 * @param document i.e: qundal_treasury_yield_curve_rates_1_mo
 * @param url: USTREASURY/YIELD
 */
const updateMultipleDocuments = async (documents: string[], marketOverview: MarketOverviewData[]) => {
  const batch = firestore().batch();
  for await (const [document, data] of zip(documents, marketOverview)) {
    batch.set(getDatabaseMarketOverviewRef(document), data);
  }
  await batch.commit();
};

/**
 * from MARKET_OVERVIEW_DATABASE_KEYS will return an array of documents that
 * have the same url.
 * Example is `treasury` we get multiple data from the same url,
 * but we want to save them in different documents.
 */
const getDocumentsToSaveData = (key: keyof typeof MARKET_OVERVIEW_DATABASE_KEYS, url: string): string[] => {
  return Object.keys(MARKET_OVERVIEW_DATABASE_KEYS[key])
    .filter((subKey) => MARKET_OVERVIEW_DATABASE_KEYS[key][subKey].url === url)
    .map((subKey) => MARKET_OVERVIEW_DATABASE_KEYS[key][subKey].document);
};
