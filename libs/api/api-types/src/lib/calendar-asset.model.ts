import { CalendarStockIPO, StockDividend, StockEarning } from './external-api';

export type CalendarDividend = Omit<StockDividend, 'recordDate' | 'paymentDate' | 'declarationDate' | 'label'>;
export type CalendarStockEarning = Omit<StockEarning, 'fiscalDateEnding' | 'updatedFromDate' | 'time'>;

export type CalendarAssetTypes = 'dividends' | 'earnings' | 'ipo';
export type CalendarAssetDataTypes = CalendarStockIPO | CalendarStockEarning | CalendarDividend;

export const resolveCalendarType = <T extends CalendarAssetDataTypes>(
  data: {
    data: CalendarAssetDataTypes[];
    date: string;
  }[],
  objectKey: keyof T
): {
  data: T[];
  date: string;
}[] => {
  const existingData = data.filter((item) => item.data && item.data.length > 0);
  return existingData.length > 0 && existingData[0].data.length > 0 && objectKey in existingData[0].data[0]
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
