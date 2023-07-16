import { CalendarStockIPO, StockDividend, StockEarning } from './external-api';

export type CalendarDividend = Omit<
  StockDividend,
  'recordDate' | 'paymentDate' | 'declarationDate' | 'label' | 'adjDividend'
>;
export type CalendarStockEarning = Omit<StockEarning, 'fiscalDateEnding' | 'updatedFromDate' | 'time'>;

export type CalendarAssetTypes = 'dividends' | 'earnings' | 'ipo';
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
  objectKey: keyof T
): {
  data: T[] | null;
  date: string;
}[] => {
  const existingData = data.filter((item) => item.data && item.data.length > 0);
  const isResolve =
    existingData.length > 0 &&
    existingData[0].data && // null or array
    existingData[0].data.length > 0 && // length of array > 0
    objectKey in existingData[0].data[0];

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
