import { getQuotesBySymbols } from '@market-monitor/api-external';
import { SymbolQuote } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getquotebysymbol = onRequest(async (request, response: Response<SymbolQuote | null>) => {
  const symbol = request.query.symbol as string;

  if (!symbol) {
    response.send(null);
    return;
  }

  const data = await getQuotesBySymbols([symbol]);
  const result = data[0] ?? null;
  response.send(result);
});

/**
 *
 * TODO: in future add caching in cloudflare
 */
export const getquotesbysymbols = onRequest(async (request, response: Response<SymbolQuote[]>) => {
  const symbol = request.query.symbol as string;
  // ignore the same symbol
  const symbolArray = symbol.split(',').filter((value, index, self) => self.indexOf(value) === index);

  if (!symbol) {
    response.send([]);
    return;
  }

  const data = await getQuotesBySymbols(symbolArray);
  response.send(data);
});
