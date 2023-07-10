import { getCalendarStockDividends } from '@market-monitor/api-external';
import { CalendarStockDividend } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getcalendarstockdividends = onRequest(async (request, response: Response<CalendarStockDividend[]>) => {
  const year = request.query.year as string;
  const month = request.query.month as string;

  const data = await getCalendarStockDividends(month, year);

  response.send(data);
});
