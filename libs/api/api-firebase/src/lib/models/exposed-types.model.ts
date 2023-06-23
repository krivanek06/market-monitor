import { HistoricalPriceFields } from './firebase-generic.model';

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
