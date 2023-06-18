import { getHistoricalPrices } from '@market-monitor/api-external';
import { StockDataHistoricalPeriods, getDatabaseStockDetailsHistorical } from '@market-monitor/api-firebase';
import { HistoricalLoadingPeriods, HistoricalPrice } from '@market-monitor/api-types';
import { format, isBefore, subDays, subMinutes } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getassethistoricalprices = onRequest(async (request, response: Response<HistoricalPrice[]>) => {
  const symbol = request.query.symbol as string;
  const period = request.query.period as keyof typeof StockDataHistoricalPeriods;
  const usedPeriod = StockDataHistoricalPeriods[period];

  // throw error if no symbol, period or period not acceptable
  if (!symbol || !period || !usedPeriod) {
    response.send([]);
    return;
  }

  const firestoreCollectionRef = getDatabaseStockDetailsHistorical(symbol, usedPeriod);
  const firestoreData = (await firestoreCollectionRef.get()).data();

  // if data exists and not older than 5 min, return data
  if (firestoreData && isBefore(subMinutes(new Date(), 5), new Date(firestoreData.lastUpdate))) {
    const reveredData = firestoreData.data.reverse();
    response.send(reveredData);
    return;
  }

  // resolve what data we have to load
  const loadingPeriod = resolveLoadingPeriod(period);
  // load data
  const historicalPriceData = await getHistoricalPrices(
    symbol,
    loadingPeriod.loadingPeriod,
    loadingPeriod.from,
    loadingPeriod.to
  );
  // save data to firestore
  await firestoreCollectionRef.set({
    data: historicalPriceData,
    lastUpdate: new Date().toISOString(),
  });
  // return data
  const reveredData = historicalPriceData.reverse();
  response.send(reveredData);
});

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

const resolveLoadingPeriod = (
  period: keyof typeof StockDataHistoricalPeriods
): {
  loadingPeriod: HistoricalLoadingPeriods;
  from: string;
  to: string;
} => {
  const today = new Date();

  if (period === '1d') {
    return {
      loadingPeriod: '1min',
      from: formatDate(subDays(today, 1)),
      to: formatDate(today),
    };
  }

  if (period === '1w') {
    return {
      loadingPeriod: '5min',
      from: formatDate(subDays(today, 7)),
      to: formatDate(today),
    };
  }

  if (period === '1mo') {
    return {
      loadingPeriod: '1hour',
      from: formatDate(subDays(today, 30)),
      to: formatDate(today),
    };
  }

  if (period === '3mo') {
    return {
      loadingPeriod: '1hour',
      from: formatDate(subDays(today, 90)),
      to: formatDate(today),
    };
  }

  if (period === '6mo') {
    return {
      loadingPeriod: '4hour',
      from: formatDate(subDays(today, 180)),
      to: formatDate(today),
    };
  }

  if (period === '1y') {
    return {
      loadingPeriod: '1day',
      from: formatDate(subDays(today, 365)),
      to: formatDate(today),
    };
  }

  if (period === '5y') {
    return {
      loadingPeriod: '1week',
      from: formatDate(subDays(today, 365 * 5)),
      to: formatDate(today),
    };
  }

  if (period === 'all') {
    return {
      loadingPeriod: '1month',
      from: formatDate(subDays(today, 365 * 20)),
      to: formatDate(today),
    };
  }

  // ytd as default
  return {
    loadingPeriod: '1day',
    from: formatDate(new Date(today.getFullYear(), 0, 1)),
    to: formatDate(today),
  };
};
