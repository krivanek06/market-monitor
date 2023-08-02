import { StockSummary } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { getSummaries, getSummary } from '../../shared';
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

  // get distinct symbols and remove '' from array
  const symbolsArray = symbolString.split(',');

  const allData = await getSummaries(symbolsArray);
  response.send(allData);
});

export const getstocksummary = onRequest(async (request, response: Response<StockSummary | string>) => {
  const symbolString = request.query.symbol as string;

  // throw error if no symbol
  if (!symbolString) {
    response.status(400).send(`Not provided symbol in query param`);
    return;
  }

  try {
    const data = await getSummary(symbolString);
    response.send(data);
  } catch (e) {
    console.log(e);
    response.status(400).send(`Unable to load summary for symbol ${symbolString}`);
  }
});
