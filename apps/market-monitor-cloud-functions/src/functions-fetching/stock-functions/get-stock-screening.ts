import { getStockScreening } from '@market-monitor/api-external';
import { StockScreenerValues, StockSummary } from '@market-monitor/api-types';
import express, { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

const app = express();

app.post('/', async (req, res: Response<StockSummary[] | string>) => {
  const requestBody = req.body ?? '{}';

  if (!requestBody) {
    res.status(400).send('Missing request body');
    return;
  }

  const requestBodyCasted = JSON.parse(requestBody) as StockScreenerValues;

  console.log('function', requestBodyCasted, typeof requestBodyCasted);
  const stockScreeningResults = await getStockScreening(requestBodyCasted);
  console.log(`stockScreeningResults: ${stockScreeningResults.length}`);
  // todo ...

  res.send([]);
});

export const getstockscreening = onRequest(app);
