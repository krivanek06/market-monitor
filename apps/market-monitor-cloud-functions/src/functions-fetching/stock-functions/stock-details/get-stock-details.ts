import {
  getCompanyKeyMetricsTTM,
  getCompanyOutlook,
  getEsgDataQuarterly,
  getEsgRatingYearly,
  getPriceTarget,
  getRecommendationTrends,
  getSectorPeersForSymbols,
  getStockHistoricalEarnings,
  getUpgradesDowngrades,
} from '@market-monitor/api-external';
import { getDatabaseStockDetailsRef } from '@market-monitor/api-firebase';
import { StockDetails, StockDetailsAPI } from '@market-monitor/api-types';
import { isBefore, subDays } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { getSummary } from '../../../shared';

/**
 * returns symbols details based on provided symbol in query
 */
export const getstockdetails = onRequest(async (request, response: Response<StockDetails | string>) => {
  const symbolString = request.query.symbol as string;
  const reload = request.query.reload === 'true' ? true : false;

  // throw error if no symbols
  if (!symbolString) {
    response.status(400).send('No symbol found in query params');
    return;
  }

  try {
    // load summary
    const summary = await getSummary(symbolString);

    // prevent loading data for etf and funds
    if (summary.profile.isEtf || summary.profile.isFund) {
      response.status(400).send('Unable to get details for FUND or ETF');
      return;
    }

    // data will be always present, if symbol does not exist, it already failed on summary
    const details = await getStockDetailsAPI(symbolString, reload);
    const result = {
      ...summary,
      ...details,
      ratio: details.companyOutlook.ratios[0],
      rating: details.companyOutlook.rating[0],
    } satisfies StockDetails;

    response.send(result);
  } catch (e) {
    console.log(e);
    response.status(500).send(`Unable to load data for ${symbolString}`);
  }
});

/**
 *
 * @param symbol
 * @returns data from database or reload them from API and update DB
 */
const getStockDetailsAPI = async (symbol: string, reload: boolean = false): Promise<StockDetailsAPI> => {
  // create DB calls
  const databaseStockDetailsRef = getDatabaseStockDetailsRef(symbol);

  // map to data format
  const databaseStockDetailsData = (await databaseStockDetailsRef.get()).data();

  if (
    // data exists
    databaseStockDetailsData &&
    // no manual reload
    !reload &&
    // no need to reload data
    !databaseStockDetailsData.reloadData &&
    // data is not older than 7 days
    !isBefore(new Date(databaseStockDetailsData.lastUpdate.detailsLastUpdate), subDays(new Date(), 7))
  ) {
    return databaseStockDetailsData;
  }

  const fetchedStockDetailsData = await reloadDetails(symbol);

  // save data into firestore
  await databaseStockDetailsRef.set(fetchedStockDetailsData);

  // return data from DB
  return fetchedStockDetailsData;
};

/**
 *
 * @param symbol
 * @returns reloaded all details for symbol from APIs
 */
const reloadDetails = async (symbol: string): Promise<StockDetailsAPI> => {
  const [
    companyOutlook,
    esgRatingYearly,
    eSGDataQuarterly,
    upgradesDowngrades,
    priceTarget,
    analystEstimatesEarnings,
    sectorPeers,
    recommendationTrends,
    companyKeyMetricsTTM,
  ] = await Promise.all([
    getCompanyOutlook(symbol),
    getEsgRatingYearly(symbol),
    getEsgDataQuarterly(symbol),
    getUpgradesDowngrades(symbol),
    getPriceTarget(symbol),
    getStockHistoricalEarnings(symbol),
    getSectorPeersForSymbols([symbol]),
    getRecommendationTrends(symbol),
    getCompanyKeyMetricsTTM(symbol),
  ]);

  const result: StockDetailsAPI = {
    companyOutlook,
    esgDataQuarterly: eSGDataQuarterly.at(-1) ?? null,
    esgDataQuarterlyArray: eSGDataQuarterly.slice(-10),
    esgDataRatingYearly: esgRatingYearly.at(-1) ?? null,
    esgDataRatingYearlyArray: esgRatingYearly.slice(-10),
    stockEarnings: analystEstimatesEarnings,
    priceTarget,
    sectorPeers,
    upgradesDowngrades,
    recommendationTrends,
    companyKeyMetricsTTM,
    reloadData: false,
    lastUpdate: {
      detailsLastUpdate: new Date().toISOString(),
      earningLastUpdate: new Date().toISOString(),
    },
  };

  return result;
};
