import { FirebaseNewsTypes } from '@market-monitor/api-types';
import { FirebaseMarketDataFields } from './firebase-market.model';

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

export const FirebaseNewsTypesCollectionResolver = (category: FirebaseNewsTypes) => {
  switch (category) {
    case 'general':
      return FirebaseMarketDataFields.market_news_general;
    case 'stocks':
      return FirebaseMarketDataFields.market_news_stocks;
    case 'forex':
      return FirebaseMarketDataFields.market_news_forex;
    case 'crypto':
      return FirebaseMarketDataFields.market_news_crypto;
  }
};
