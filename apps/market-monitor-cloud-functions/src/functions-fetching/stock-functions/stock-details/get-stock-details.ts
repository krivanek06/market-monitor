import {
  getCompanyOutlook,
  getEsgDataQuarterly,
  getEsgRatingYearly,
  getPriceTarget,
  getRecommendationTrends,
  getSectorPeersForSymbols,
  getStockHistoricalEarnings,
  getStockNews,
  getUpgradesDowngrades,
} from '@market-monitor/api-external';
import { getDatabaseStockDetailsRef } from '@market-monitor/api-firebase';
import { StockDetails } from '@market-monitor/api-types';
import { isBefore, subDays, subHours } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

/**
 * returns symbols details based on provided symbol in query
 */
export const getstockdetails = onRequest(async (request, response: Response<StockDetails | null>) => {
  const symbolString = request.query.symbol as string;

  // throw error if no symbols
  if (!symbolString) {
    response.send(null);
    return;
  }

  // create DB calls
  const databaseStockDetailsRef = getDatabaseStockDetailsRef(symbolString);

  // map to data format
  let databaseStockDetailsData = (await databaseStockDetailsRef.get()).data();

  if (
    // data exists
    databaseStockDetailsData &&
    // no need to reload data
    !databaseStockDetailsData.reloadData &&
    // data is not older than 7 days
    !isBefore(new Date(databaseStockDetailsData.lastUpdate.detailsLastUpdate), subDays(new Date(), 7)) &&
    // news are not older than 12h
    !isBefore(new Date(databaseStockDetailsData.lastUpdate.newsLastUpdate), subHours(new Date(), 12))
  ) {
    response.send(databaseStockDetailsData);
    return;
  }

  if (
    // no data in DB
    !databaseStockDetailsData ||
    // admin force reload
    databaseStockDetailsData.reloadData ||
    // data is older than 7 days
    isBefore(new Date(databaseStockDetailsData.lastUpdate.detailsLastUpdate), subDays(new Date(), 7))
  ) {
    databaseStockDetailsData = await reloadDetails(symbolString);
  }

  // check if new are not older than 12h
  if (isBefore(new Date(databaseStockDetailsData.lastUpdate.detailsLastUpdate), subHours(new Date(), 12))) {
    databaseStockDetailsData = await reloadNews(symbolString, databaseStockDetailsData);
  }

  // save data into firestore
  await databaseStockDetailsRef.set(databaseStockDetailsData);

  // return data from DB
  response.send(databaseStockDetailsData);
});

/**
 *
 * @param symbol
 * @param stockDetails
 * @returns reloaded news for symbol from APIs
 */
const reloadNews = async (symbol: string, stockDetails: StockDetails): Promise<StockDetails> => {
  const stockNews = await getStockNews(symbol);
  const result = {
    ...stockDetails,
    stockNews: stockNews.slice(-15),
    ...{
      lastUpdate: {
        ...stockDetails.lastUpdate,
        newsLastUpdate: new Date().toISOString(),
      },
    },
  };

  return result;
};

/**
 *
 * @param symbol
 * @returns reloaded all details for symbol from APIs
 */
const reloadDetails = async (symbol: string): Promise<StockDetails> => {
  const [
    companyOutlook,
    esgRatingYearly,
    eSGDataQuarterly,
    upgradesDowngrades,
    priceTarget,
    analystEstimatesEarnings,
    sectorPeers,
    recommendationTrends,
    stockNews,
  ] = await Promise.all([
    getCompanyOutlook(symbol),
    getEsgRatingYearly(symbol),
    getEsgDataQuarterly(symbol),
    getUpgradesDowngrades(symbol),
    getPriceTarget(symbol),
    getStockHistoricalEarnings(symbol),
    getSectorPeersForSymbols([symbol]),
    getRecommendationTrends(symbol),
    getStockNews(symbol),
  ]);

  const result: StockDetails = {
    companyOutlook,
    esgDataQuarterly: eSGDataQuarterly.at(-1) ?? null,
    esgDataQuarterlyArray: eSGDataQuarterly.slice(-10),
    esgDataRatingYearly: esgRatingYearly.at(-1) ?? null,
    esgDataRatingYearlyArray: esgRatingYearly.slice(-10),
    stockEarnings: analystEstimatesEarnings,
    stockNews: stockNews.slice(-15),
    priceTarget,
    sectorPeers,
    upgradesDowngrades,
    recommendationTrends,
    reloadData: false,
    lastUpdate: {
      detailsLastUpdate: new Date().toISOString(),
      newsLastUpdate: new Date().toISOString(),
      earningLastUpdate: new Date().toISOString(),
    },
  };

  return result;
};
