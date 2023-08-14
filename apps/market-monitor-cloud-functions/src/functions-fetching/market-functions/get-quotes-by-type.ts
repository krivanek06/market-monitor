import { getQuotesByType } from '@market-monitor/api-external';
import { AvailableQuotes, AvailableQuotesConst, SymbolQuote } from '@market-monitor/api-types';
import { Request, Response } from 'express';

/**
 * Data is not saved in firestore, because of its size.
 * It is fetched from financial modeling prep api
 *
 * TODO: in future add caching in cloudflare
 */
export const getQuotesByTypeWrapper = async (request: Request, response: Response<SymbolQuote[] | string>) => {
  const quoteType = request.query.type as AvailableQuotes;

  if (!quoteType) {
    response.status(400).send('Missing required query parameter: type');
    return;
  }

  if (!AvailableQuotesConst.includes(quoteType)) {
    response.status(400).send(`Invalid quote type: ${quoteType}`);
    return;
  }

  const data = await getQuotesByType(quoteType);
  response.send(data);
};
