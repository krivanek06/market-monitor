import { getStockScreening } from '@market-monitor/api-external';
import { StockScreenerValues, StockSummary } from '@market-monitor/api-types';
import express, { Response } from 'express';
import { chunk, flatten } from 'lodash-es';
import { getSummaries } from '../../shared';

const app = express();

app.post('/', async (req, res: Response<StockSummary[] | string>) => {
  const requestBody = req.body ?? ({} as StockScreenerValues);

  if (!requestBody) {
    res.status(400).send('Missing request body');
    return;
  }

  let screenerValues: StockScreenerValues;
  try {
    screenerValues = JSON.parse(requestBody);
  } catch {
    screenerValues = requestBody;
  }

  // const requestBodyJson = JSON.parse(requestBody) as StockScreenerValues;
  const stockScreeningResults = await getStockScreening(screenerValues);

  // create multiple requests
  const symbolsChunks = chunk(
    stockScreeningResults.map((data) => data.symbol),
    40,
  ) as string[][];

  // get summaries for all symbols
  const summaries = flatten(await Promise.all(symbolsChunks.map((chunk) => getSummaries(chunk))));
  const summariesOrder = summaries.slice().sort((a, b) => a.id.localeCompare(b.id));

  res.send(summariesOrder);
});

export const getStockScreeningWrapper = app;
