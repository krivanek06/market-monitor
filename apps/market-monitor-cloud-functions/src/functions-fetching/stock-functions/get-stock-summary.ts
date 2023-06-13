import { StockSummary } from '@market-monitor/shared-types';
import { isBefore, subMinutes } from 'date-fns';
import { Response } from 'express';
import { firestore } from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import {
  getCompanyQuote,
  getDatabaseStockSummaryRef,
  getProfile,
  getStockPriceChange,
} from '../../api';
import { ensureFind } from '../../utils/ensure-find.util';

/**
 * query.symbols contains a comma-separated list of stock symbols 'symbols=MSFT,AAPL,GOOG'
 *
 */
export const getstocksummaries = onRequest(
  async (request, response: Response<StockSummary[]>) => {
    const symbolString = (request.query.symbol as string) ?? '';

    // throw error if no symbols
    if (!symbolString) {
      response.send([]);
      return;
    }

    // get distinct symbols
    const symbolsArray = symbolString
      .split(',')
      .filter((value, index, self) => self.indexOf(value) === index);
    console.log(symbolsArray);
    const allData = await getQuotes(symbolsArray);
    response.send(allData);
  }
);

export const getstocksummary = onRequest(
  async (request, response: Response<StockSummary | null>) => {
    const symbolString = request.query.symbol as string;

    // throw error if no symbol
    if (!symbolString) {
      response.send(null);
      return;
    }

    const allData = await getQuotes([symbolString]);
    const data = allData[0] ?? null;
    response.send(data);
  }
);

/**
 * check symbols against database if data not older than 3 min return, else fetch new data
 * and persist in DB
 *
 * @param symbolsArray
 * @returns
 */
const getQuotes = async (symbolsArray: string[]): Promise<StockSummary[]> => {
  // create DB calls
  const databaseCallsForSymbol = symbolsArray.map((symbol) =>
    getDatabaseStockSummaryRef(symbol)
  );

  // get data from DB
  const databasePromises = await Promise.all(
    databaseCallsForSymbol.map((doc) => doc.get())
  );
  const firebaseData = databasePromises
    .filter((doc) => doc.exists)
    .map((doc) => doc.data() as StockSummary);

  // filter out data no later than 3 min
  const filteredDatabaseDataNotUpdate = firebaseData.filter((data) => {
    const threeMinAgo = subMinutes(new Date(), 3);
    return isBefore(threeMinAgo, new Date(data.summaryLastUpdate));
  });

  // map to symbols
  const filteredDatabaseSymbolsNotUpdate = filteredDatabaseDataNotUpdate.map(
    (d) => d.id
  );

  // symbols to update in DB
  const symbolsToUpdate = symbolsArray.filter(
    (symbol) => !filteredDatabaseSymbolsNotUpdate.includes(symbol)
  );
  console.log('Summary update:', symbolsToUpdate);

  if (symbolsToUpdate.length === 0) {
    return filteredDatabaseDataNotUpdate.filter(
      (d) => d.quote.marketCap > 0 && d.quote.sharesOutstanding > 0
    );
  }

  // load data from api - quote, profile, stock price change
  const [updatedQuotes, updatedProfiles, stockPriceChange] = await Promise.all([
    getCompanyQuote(symbolsToUpdate),
    getProfile(symbolsToUpdate),
    getStockPriceChange(symbolsToUpdate),
  ]);

  // map to correct data structure
  const newData = symbolsToUpdate.map((symbol) => {
    // find data from loaded API - ensureFind throws error if not found
    const quote = ensureFind(updatedQuotes.find((q) => q.symbol === symbol));
    const profile = ensureFind(
      updatedProfiles.find((p) => p.symbol === symbol)
    );
    const priceChange = ensureFind(
      stockPriceChange.find((p) => p.symbol === symbol)
    );

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
  });

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
