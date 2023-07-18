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
import {
  CalendarAssetDataTypes,
  CalendarAssetTypes,
  CalendarStockEarning,
  CalendarStockIPO,
  CompanyStockDividend,
} from '@market-monitor/api-types';
import { isBefore, subDays } from 'date-fns';
import { Response } from 'express';
import { firestore } from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';

export const getcalendarstockdividends = onRequest(
  async (request, response: Response<CompanyStockDividend[] | string>) => {
    const year = request.query.year as string;
    const month = request.query.month as string;

    // missing data
    if (!year || !month) {
      response.status(400).send('Missing year or month from the request');
    }

    const data = await getDataForCalendar<CompanyStockDividend>('dividends', year, month);
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

const getDataForCalendar = async <T extends CalendarAssetDataTypes>(
  type: CalendarAssetTypes,
  year: string,
  month: string
): Promise<T[]> => {
  const databaseRefFunction = resolveDatabaseByType(type);

  const firebaseRef = databaseRefFunction(month, year) as firestore.DocumentReference<DataSnapshot<T[]>>;
  const firebaseData = (await firebaseRef.get()).data() as DataSnapshot<T[]>;

  // if data exists and not older than 4 days
  if (firebaseData && isBefore(subDays(new Date(), 4), new Date(firebaseData.lastUpdate))) {
    return firebaseData.data;
  }

  // update data from endpoint and save to firebase
  const data = await resultAPIbyType<T>(type, year, month);

  // limit max data to save into firebase, to 65 000 reaching 1MB
  const dataLimit = 65_000;
  if (data.length > dataLimit) {
    console.log(`Data limit reached 65 000 records [year=${year}, month=${month}, data length = ${data.length}]`);
    return data;
  }

  firebaseRef.set({
    lastUpdate: new Date().toISOString(),
    data,
  });

  return data;
};

const resultAPIbyType = <T extends CalendarAssetDataTypes>(
  type: CalendarAssetTypes,
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

const resolveDatabaseByType = (type: CalendarAssetTypes) => {
  switch (type) {
    case 'dividends':
      return getDatabaseMarketCalendarDividendsRef;
    case 'earnings':
      return getDatabaseMarketCalendarEarningsRef;
    case 'ipo':
      return getDatabaseMarketCalendarIPOsRef;
  }
};
