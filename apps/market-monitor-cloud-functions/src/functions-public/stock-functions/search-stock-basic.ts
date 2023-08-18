import { searchTicker } from '@market-monitor/api-external';
import { StockSummary } from '@market-monitor/api-types';
import { Request, Response } from 'express';
import { getStockSummariesWrapper } from './get-stock-summary';

export const searchStocksBasicWrapper = async (request: Request, response: Response<StockSummary[]>) => {
  const symbolString = request.query.symbol as string;

  // no symbol provided
  if (!symbolString) {
    response.send([]);
    return;
  }

  const searchedTickers = await searchTicker(symbolString);
  const searchedSymbol = searchedTickers.map((d) => d.symbol);
  console.log('searchedSymbol', searchedSymbol);

  // add symbols to query
  request.query.symbol = searchedSymbol.join(',');

  return getStockSummariesWrapper(request, response);
};
