import { HistoricalLoadingPeriods } from '@market-monitor/api-types';
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import { firestore } from 'firebase-admin';

export const filterOutSymbols = <T extends { symbol: string }>(
  data: T[],
  nonNullableKeys: (keyof T)[] = [],
  removeKeys: (keyof T)[] = [],
): T[] => {
  // if symbol con any of the ignored symbols, filter them out
  const ignoredSymbols = ['.', '-', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return (
    data
      // filter out symbols that contain any of the ignored symbols
      .filter((d) => !ignoredSymbols.some((ignoredSymbol) => d.symbol.includes(ignoredSymbol)))
      // filter out symbols if multiple one in the array
      // .filter((d, index) => data.indexOf(d) === index)
      // filter out symbols if keys are null
      .filter((d) => nonNullableKeys.every((key) => !!d[key]))
      .map((d) => {
        removeKeys.forEach((key) => delete d[key]);
        return d;
      })
  );
};

export const getDateRangeByMonthAndYear = (month: number | string, year: number | string): [string, string] => {
  const date = new Date(`${year}-${month}-01`);
  const from = startOfMonth(date).toISOString().split('T')[0];
  const to = endOfMonth(date).toISOString().split('T')[0];
  return [from, to];
};

export const HistoricalPricePeriodsArray = ['1d', '1w', '1mo', '3mo', '6mo', '1y', '5y', 'ytd', 'all'] as const;
export type HistoricalPricePeriods = (typeof HistoricalPricePeriodsArray)[number];
export const resolveLoadingPeriod = (
  period: HistoricalPricePeriods,
): {
  loadingPeriod: HistoricalLoadingPeriods;
  from: string;
  to: string;
} => {
  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  const today = new Date();
  if (period === '1d') {
    return {
      loadingPeriod: '1min',
      from: formatDate(today),
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

/**
 * usage: .withConverter(assignTypes<DataSnapshot<SymbolOwnershipHolders[]>>());
 *
 * @returns
 */
export const assignTypes = <T extends object>() => {
  return {
    toFirestore(doc: T): firestore.DocumentData {
      return doc;
    },
    fromFirestore(snapshot: firestore.QueryDocumentSnapshot): T {
      return snapshot.data()! as T;
    },
  };
};
