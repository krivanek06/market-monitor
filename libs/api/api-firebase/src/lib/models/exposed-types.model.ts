export type DataSnapshot<T> = {
  lastUpdate: string;
  data: T;
};

export enum HistoricalPriceFields {
  historical_1d = 'historical_price_1d',
  historical_1wk = 'historical_price_1wk',
  historical_1mo = 'historical_price_1mo',
  historical_3mo = 'historical_price_3mo',
  historical_6mo = 'historical_price_6mo',
  historical_ytd = 'historical_price_ytd',
  historical_1yr = 'historical_price_1yr',
  historical_5yr = 'historical_price_5yr',
  historical_all = 'historical_price_all',
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

export const HistoricalPricePeriods = {
  '1d': HistoricalPriceFields.historical_1d,
  '1w': HistoricalPriceFields.historical_1wk,
  '1mo': HistoricalPriceFields.historical_1mo,
  '3mo': HistoricalPriceFields.historical_3mo,
  '6mo': HistoricalPriceFields.historical_6mo,
  '1y': HistoricalPriceFields.historical_1yr,
  '5y': HistoricalPriceFields.historical_5yr,
  ytd: HistoricalPriceFields.historical_ytd,
  all: HistoricalPriceFields.historical_all,
} as const;
