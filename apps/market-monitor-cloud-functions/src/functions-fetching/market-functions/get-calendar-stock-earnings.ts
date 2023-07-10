import { getCalendarStockEarnings } from '@market-monitor/api-external';
import { CalendarStockEarning } from '@market-monitor/api-types';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getcalendarstockearnigns = onRequest(async (request, response: Response<CalendarStockEarning[]>) => {
  const year = request.query.year as string;
  const month = request.query.month as string;

  const data = await getCalendarStockEarnings(month, year);

  response.send(data);
});
