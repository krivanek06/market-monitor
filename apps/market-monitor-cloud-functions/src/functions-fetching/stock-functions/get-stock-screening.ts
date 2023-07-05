import { getStockScreening } from '@market-monitor/api-external';
import { StockScreenerValues, StockSummary } from '@market-monitor/api-types';
import express, { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { chunk, flatten } from 'lodash';
import { getSummaries } from '../../functions-shared';

const app = express();

app.post('/', async (req, res: Response<StockSummary[] | string>) => {
  const requestBody = (req.body ?? {}) as StockScreenerValues;

  if (!requestBody) {
    res.status(400).send('Missing request body');
    return;
  }
  console.log(requestBody);
  const stockScreeningResults = await getStockScreening(requestBody);
  console.log(`stockScreeningResults: ${stockScreeningResults.length}`);

  // create multiple requests
  const symbolsChunks = chunk(
    stockScreeningResults.map((data) => data.symbol),
    40
  ) as string[][];

  // get summaries for all symbols
  const summaries = flatten(await Promise.all(symbolsChunks.map((chunk) => getSummaries(chunk))));
  const summariesOrder = summaries.slice().sort((a, b) => a.id.localeCompare(b.id));

  res.send(summariesOrder);
});

export const getstockscreening = onRequest(app);
