export interface DataSnapshot<T> {
  lastUpdate: string;
  data: T;
}

export enum HistoricalPriceFields {
  historical_1d = 'historical_1d',
  historical_1wk = 'historical_1wk',
  historical_1mo = 'historical_1mo',
  historical_3mo = 'historical_3mo',
  historical_6mo = 'historical_6mo',
  historical_ytd = 'historical_ytd',
  historical_1yr = 'historical_1yr',
  historical_5yr = 'historical_5yr',
  historical_all = 'historical_all',
}

export type HistoricalPriceTypes =
  | HistoricalPriceFields.historical_1d
  | HistoricalPriceFields.historical_1wk
  | HistoricalPriceFields.historical_1mo
  | HistoricalPriceFields.historical_3mo
  | HistoricalPriceFields.historical_6mo
  | HistoricalPriceFields.historical_ytd
  | HistoricalPriceFields.historical_1yr
  | HistoricalPriceFields.historical_5yr
  | HistoricalPriceFields.historical_all;
