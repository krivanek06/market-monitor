import { FirebaseStockDataFields } from './firebase-stock.model';

export type StockDataHistorical =
  | FirebaseStockDataFields.stock_historical_1d
  | FirebaseStockDataFields.stock_historical_1wk
  | FirebaseStockDataFields.stock_historical_1mo
  | FirebaseStockDataFields.stock_historical_3mo
  | FirebaseStockDataFields.stock_historical_6mo
  | FirebaseStockDataFields.stock_historical_ytd
  | FirebaseStockDataFields.stock_historical_1yr
  | FirebaseStockDataFields.stock_historical_5yr
  | FirebaseStockDataFields.stock_historical_all;

export const StockDataHistoricalPeriods = {
  '1d': FirebaseStockDataFields.stock_historical_1d,
  '1w': FirebaseStockDataFields.stock_historical_1wk,
  '1mo': FirebaseStockDataFields.stock_historical_1mo,
  '3mo': FirebaseStockDataFields.stock_historical_3mo,
  '6mo': FirebaseStockDataFields.stock_historical_6mo,
  '1y': FirebaseStockDataFields.stock_historical_1yr,
  '5y': FirebaseStockDataFields.stock_historical_5yr,
  ytd: FirebaseStockDataFields.stock_historical_ytd,
  all: FirebaseStockDataFields.stock_historical_all,
} as const;
