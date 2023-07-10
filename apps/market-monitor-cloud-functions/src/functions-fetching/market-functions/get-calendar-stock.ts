import {
  getCalendarStockDividends,
  getCalendarStockEarnings,
  getCalendarStockIPOs,
} from '@market-monitor/api-external';
import {
  DataSnapshot,
  getDatabaseMarketCalendarDividendsRef,
  getDatabaseMarketCalendarEarningsRef,
  getDatabaseMarketCalendarIPOsRef,
} from '@market-monitor/api-firebase';
import { CalendarStockDividend, CalendarStockEarning, CalendarStockIPO } from '@market-monitor/api-types';
import { Response } from 'express';
import { firestore } from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';

type CalendarTypes = 'dividends' | 'earnings' | 'ipo';
type CalendarDataTypes = CalendarStockDividend | CalendarStockIPO | CalendarStockEarning;

export const getcalendarstockdividends = onRequest(
  async (request, response: Response<CalendarStockDividend[] | string>) => {
    const year = request.query.year as string;
    const month = request.query.month as string;

    // missing data
    if (!year || !month) {
      response.status(400).send('Missing year or month from the request');
    }

    const data = await getDataForCalendar<CalendarStockDividend>('dividends', year, month);
    response.send(data);
  }
);

export const getcalendarstockearnigns = onRequest(
  async (request, response: Response<CalendarStockEarning[] | string>) => {
    const year = request.query.year as string;
    const month = request.query.month as string;

    if (!year || !month) {
      response.status(400).send('Missing year or month from the request');
    }

    const data = await getDataForCalendar<CalendarStockEarning>('earnings', year, month);
    response.send(data);
  }
);

export const getcalendarstockipos = onRequest(async (request, response: Response<CalendarStockIPO[] | string>) => {
  const year = request.query.year as string;
  const month = request.query.month as string;

  if (!year || !month) {
    response.status(400).send('Missing year or month from the request');
  }

  const data = await getDataForCalendar<CalendarStockIPO>('ipo', year, month);
  response.send(data);
});

const getDataForCalendar = async <T extends CalendarDataTypes>(
  type: CalendarTypes,
  year: string,
  month: string
): Promise<T[]> => {
  const databaseRefFunction = resolveDatabaseByType(type);

  const firebaseRef = databaseRefFunction(month, year) as firestore.DocumentReference<DataSnapshot<T[]>>;
  const firebaseData = (await firebaseRef.get()).data() as DataSnapshot<T[]>;

  // if data exists, send to the client
  if (firebaseData) {
    return firebaseData.data;
  }

  // update data from endpoint and save to firebase
  const data = await resultAPIbyType<T>(type, year, month);
  firebaseRef.set({
    lastUpdate: new Date().toISOString(),
    data,
  });

  return data;
};

const resultAPIbyType = <T extends CalendarDataTypes>(
  type: CalendarTypes,
  year: string,
  month: string
): Promise<T[]> => {
  switch (type) {
    case 'dividends':
      return getCalendarStockDividends(month, year) as Promise<T[]>;
    case 'earnings':
      return getCalendarStockEarnings(month, year) as Promise<T[]>;
    case 'ipo':
      return getCalendarStockIPOs(month, year) as Promise<T[]>;
  }
};

const resolveDatabaseByType = (type: CalendarTypes) => {
  switch (type) {
    case 'dividends':
      return getDatabaseMarketCalendarDividendsRef;
    case 'earnings':
      return getDatabaseMarketCalendarEarningsRef;
    case 'ipo':
      return getDatabaseMarketCalendarIPOsRef;
  }
};
