import { StockSummary } from '@market-monitor/api-types';
import { Request, Response } from 'express';
import { getSummaries, getSummary } from '../../shared';
/**
 * query.symbols contains a comma-separated list of stock symbols 'symbols=MSFT,AAPL,GOOG'
 *
 */
export const getStockSummariesWrapper = async (request: Request, response: Response<StockSummary[]>) => {
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
};

export const getStockSummaryWrapper = async (request, response: Response<StockSummary | string>) => {
  const symbolString = request.query.symbol as string;

  // throw error if no symbol
  if (!symbolString) {
    response.status(400).send(`Not provided symbol in query param`);
    return;
  }

  const data = await getSummary(symbolString);
  response.send(data);
};
