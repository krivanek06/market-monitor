import { CalendarStockIPO, CompanyStockDividend, StockEarning } from '../external-api';

export type CalendarDividend = Omit<
  CompanyStockDividend,
  'recordDate' | 'paymentDate' | 'declarationDate' | 'label' | 'adjDividend'
>;
export type CalendarStockEarning = Omit<StockEarning, 'fiscalDateEnding' | 'updatedFromDate' | 'time'>;

export const AllowedCalendarAssetTypes = ['ipo', 'earnings', 'dividends'] as const;
export type CalendarAssetTypes = (typeof AllowedCalendarAssetTypes)[number];
export type CalendarAssetDataTypes = CalendarStockIPO | CalendarStockEarning | CalendarDividend;
