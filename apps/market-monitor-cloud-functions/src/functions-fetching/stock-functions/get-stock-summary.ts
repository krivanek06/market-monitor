import { StockSummary } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { getSummaries } from '../../functions-shared';

/**
 * query.symbols contains a comma-separated list of stock symbols 'symbols=MSFT,AAPL,GOOG'
 *
 */
export const getstocksummaries = onRequest(async (request, response: Response<StockSummary[]>) => {
  const symbolString = (request.query.symbol as string) ?? '';

  // throw error if no symbols
  if (!symbolString) {
    response.send([]);
    return;
  }

  // get distinct symbols
  const symbolsArray = symbolString.split(',').filter((value, index, self) => self.indexOf(value) === index);

  const allData = await getSummaries(symbolsArray);
  response.send(allData);
});

export const getstocksummary = onRequest(async (request, response: Response<StockSummary | null>) => {
  const symbolString = request.query.symbol as string;

  // throw error if no symbol
  if (!symbolString) {
    response.send(null);
    return;
  }

  const allData = await getSummaries([symbolString]);
  const data = allData[0] ?? null;
  response.send(data);
});
