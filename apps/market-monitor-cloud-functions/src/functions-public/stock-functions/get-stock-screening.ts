import { getStockScreening } from '@market-monitor/api-external';
import { StockScreenerValues, StockSummary } from '@market-monitor/api-types';
import express, { Response } from 'express';
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
  const checkSize = 40;
  const symbolsChunks = stockScreeningResults
    .map((data) => data.symbol)
    .reduce((acc, symbol, index) => {
      // if (index % checkSize === 0) then create new array with symbol else add symbol to last array
      return index % checkSize === 0 ? [...acc, [symbol]] : [...acc.slice(0, -1), [...acc[acc.length - 1], symbol]];
    }, [] as string[][]);

  // get summaries for all symbols
  const summaries = (await Promise.all(symbolsChunks.map((chunk) => getSummaries(chunk)))).flat();
  const summariesOrder = summaries.slice().sort((a, b) => a.id.localeCompare(b.id));

  res.send(summariesOrder);
});

export const getStockScreeningWrapper = app;
