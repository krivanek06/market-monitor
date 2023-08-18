import { getCompanyQuote, getProfile, getSymbolsPriceChanges } from '@market-monitor/api-external';
import { getDatabaseStockSummaryRef } from '@market-monitor/api-firebase';
import { StockSummary } from '@market-monitor/api-types';
import { isBefore, subMinutes } from 'date-fns';
import { firestore } from 'firebase-admin';
import { uniqBy } from 'lodash';

export const getSummary = async (symbol: string): Promise<StockSummary> => {
  const data = await getSummaries([symbol]);
  const summary = data[0];

  if (!summary) {
    throw new Error(`Unable to load summary for symbol ${symbol}, most likely does not exist`);
  }

  return summary;
};

/**
 * check symbols against database if data not older than 3 min return, else fetch new data
 * and persist in DB
 *
 * return empty array if symbols does not exists in exchange
 * returns data for ETF, funds too
 *
 * @param symbolsArray
 * @returns
 */
export const getSummaries = async (symbolsArray: string[]): Promise<StockSummary[]> => {
  // create DB calls
  const databaseCallsForSymbol = uniqBy(symbolsArray, (d) => d)
    .filter((d) => !!d)
    .map((symbol) => getDatabaseStockSummaryRef(symbol));

  // get data from DB
  const databasePromises = await Promise.all(databaseCallsForSymbol.map((doc) => doc.get()));
  const firebaseData = databasePromises.filter((doc) => doc.exists).map((doc) => doc.data() as StockSummary);

  // filter out data no later than 3 min
  const filteredDatabaseDataNotUpdate = firebaseData.filter((data) => {
    const threeMinAgo = subMinutes(new Date(), 3);
    return isBefore(threeMinAgo, new Date(data.summaryLastUpdate));
  });

  // symbols to update in DB
  const symbolsToUpdate = symbolsArray.filter(
    (symbol) => !filteredDatabaseDataNotUpdate.map((d) => d.id).includes(symbol),
  );

  if (symbolsToUpdate.length === 0) {
    return filteredDatabaseDataNotUpdate;
  }

  // load data from api - quote, profile, stock price change
  const [updatedQuotes, updatedProfiles, stockPriceChange] = await Promise.all([
    getCompanyQuote(symbolsToUpdate),
    getProfile(symbolsToUpdate),
    getSymbolsPriceChanges(symbolsToUpdate),
  ]);

  // map to correct data structure
  const newData = symbolsToUpdate
    .map((symbol) => {
      // find data from loaded API - ensureFind throws error if not found
      const quote = updatedQuotes.find((q) => q.symbol === symbol);
      const profile = updatedProfiles.find((p) => p.symbol === symbol);
      const priceChange = stockPriceChange.find((p) => p.symbol === symbol);

      // if any of the data is missing, return undefined
      if (!quote || !profile || !priceChange) {
        return undefined;
      }

      // get data from DB or set to null
      const firebaseRecord = firebaseData.find((d) => d.id === symbol);

      const stockSummary: StockSummary = {
        id: symbol,
        quote,
        profile,
        priceChange,
        reloadData: firebaseRecord?.reloadData ?? false,
        reloadDetailsData: firebaseRecord?.reloadDetailsData ?? true,
        summaryLastUpdate: new Date().toISOString(),
      };
      return stockSummary;
    })
    // filter out undefined values
    .filter((d) => !!d);

  // save updated data to DB by batch
  const batch = firestore().batch();
  newData.forEach((data) => {
    batch.set(getDatabaseStockSummaryRef(data.id), data);
  });
  await batch.commit();

  // return data for all searched quotes
  return [...filteredDatabaseDataNotUpdate, ...newData];
};
