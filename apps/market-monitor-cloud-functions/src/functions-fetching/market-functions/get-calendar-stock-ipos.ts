import { getCalendarStockIPOs } from '@market-monitor/api-external';
import { CalendarStockIPO } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getcalendarstockipos = onRequest(async (request, response: Response<CalendarStockIPO[]>) => {
  const year = request.query.year as string;
  const month = request.query.month as string;

  const data = await getCalendarStockIPOs(month, year);

  response.send(data);
});
