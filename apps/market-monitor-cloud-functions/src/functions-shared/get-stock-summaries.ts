import { StockSummary } from '@market-monitor/shared-types';
import { isBefore, subMinutes } from 'date-fns';
import { firestore } from 'firebase-admin';
import { getCompanyQuote, getDatabaseStockSummaryRef, getProfile, getSymbolsPriceChanges } from '../api';

/**
 * check symbols against database if data not older than 3 min return, else fetch new data
 * and persist in DB
 *
 * @param symbolsArray
 * @returns
 */
export const getSummaries = async (symbolsArray: string[]): Promise<StockSummary[]> => {
  // create DB calls
  const databaseCallsForSymbol = symbolsArray.map((symbol) => getDatabaseStockSummaryRef(symbol));

  // get data from DB
  const databasePromises = await Promise.all(databaseCallsForSymbol.map((doc) => doc.get()));
  const firebaseData = databasePromises.filter((doc) => doc.exists).map((doc) => doc.data() as StockSummary);

  // filter out data no later than 3 min
  const filteredDatabaseDataNotUpdate = firebaseData.filter((data) => {
    const threeMinAgo = subMinutes(new Date(), 3);
    return isBefore(threeMinAgo, new Date(data.summaryLastUpdate));
  });

  // map to symbols
  const filteredDatabaseSymbolsNotUpdate = filteredDatabaseDataNotUpdate.map((d) => d.id);

  // symbols to update in DB
  const symbolsToUpdate = symbolsArray.filter((symbol) => !filteredDatabaseSymbolsNotUpdate.includes(symbol));
  console.log('Summary update:', symbolsToUpdate);

  if (symbolsToUpdate.length === 0) {
    return filteredDatabaseDataNotUpdate.filter((d) => d.quote.marketCap > 0 && d.quote.sharesOutstanding > 0);
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
  return [...filteredDatabaseDataNotUpdate, ...newData].filter(
    (d) => d.quote.marketCap > 0 && d.quote.sharesOutstanding > 0
  );
};
