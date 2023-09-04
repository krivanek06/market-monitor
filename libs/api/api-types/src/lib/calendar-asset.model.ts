import { CalendarStockIPO, CompanyStockDividend, StockEarning } from './external-api';

export type CalendarDividend = Omit<
  CompanyStockDividend,
  'recordDate' | 'paymentDate' | 'declarationDate' | 'label' | 'adjDividend'
>;
export type CalendarStockEarning = Omit<StockEarning, 'fiscalDateEnding' | 'updatedFromDate' | 'time'>;

export const AllowedCalendarAssetTypes = ['ipo', 'earnings', 'dividends'] as const;
export type CalendarAssetTypes = (typeof AllowedCalendarAssetTypes)[number];
export type CalendarAssetDataTypes = CalendarStockIPO | CalendarStockEarning | CalendarDividend;

/**
 * based on the provided type T it will resolve to correct TS type
 *
 * @param data
 * @param objectKey
 * @returns
 */
export const resolveCalendarType = <T extends CalendarAssetDataTypes>(
  data: {
    data: CalendarAssetDataTypes[] | null;
    date: string;
  }[],
  objectKey: keyof T,
): {
  data: T[] | null;
  date: string;
}[] => {
  const existingData = data.filter((item) => item.data && item.data.length > 0)[0];

  if (!existingData) {
    return [];
  }

  const isResolve =
    existingData.data && // null or array
    !!existingData.data[0] && // length of array > 0
    objectKey in existingData.data[0];

  return isResolve
    ? (data as {
        data: T[];
        date: string;
      }[])
    : [];
};

export const isDividendType = (data: CalendarAssetDataTypes): data is CalendarDividend => {
  return (data as CalendarDividend).dividend !== undefined;
};

export const isEarningsType = (data: CalendarAssetDataTypes): data is CalendarStockEarning => {
  return (data as CalendarStockEarning).epsEstimated !== undefined;
};

export const isIPOType = (data: CalendarAssetDataTypes): data is CalendarStockIPO => {
  return (data as CalendarStockIPO).cik !== undefined;
};
