import { StockSummary } from '@market-monitor/shared-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { searchTicker } from './../../api';
import { getstocksummaries } from './get-stock-summary';

export const searchstocksbasic = onRequest(
  async (request, response: Response<StockSummary[]>) => {
    try {
      const symbolString = request.query.symbol as string;

      // no symbol provided
      if (!symbolString) {
        response.send([]);
        return;
      }

      const searchedTickers = await searchTicker(symbolString);
      const searchedSymbol = searchedTickers.map((d) => d.symbol);

      // add symbols to query
      request.query.symbol = searchedSymbol.join(',');

      return getstocksummaries(request, response);
    } catch (error) {
      console.error(error);
      response.send([]);
    }
  }
);
