import { CalendarStockIPO, CompanyStockDividend, StockEarning } from '../external-api';
import { OmitStrict } from '../utils';

export type CalendarDividend = OmitStrict<
  CompanyStockDividend,
  'recordDate' | 'paymentDate' | 'declarationDate' | 'label' | 'adjDividend'
>;
export type CalendarStockEarning = OmitStrict<StockEarning, 'fiscalDateEnding' | 'updatedFromDate' | 'time'>;

export const AllowedCalendarAssetTypes = ['ipo', 'earnings', 'dividends'] as const;
export type CalendarAssetTypes = (typeof AllowedCalendarAssetTypes)[number];
export type CalendarAssetDataTypes = CalendarStockIPO | CalendarStockEarning | CalendarDividend;
