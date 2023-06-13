import { StockDataFields } from './firebase-stock.model';

export type StockDataHistorical =
	| StockDataFields.stock_historical_1d
	| StockDataFields.stock_historical_1wk
	| StockDataFields.stock_historical_1mo
	| StockDataFields.stock_historical_3mo
	| StockDataFields.stock_historical_6mo
	| StockDataFields.stock_historical_ytd
	| StockDataFields.stock_historical_1yr
	| StockDataFields.stock_historical_5yr
	| StockDataFields.stock_historical_all;

export const StockDataHistoricalPeriods = {
	'1d': StockDataFields.stock_historical_1d,
	'1w': StockDataFields.stock_historical_1wk,
	'1mo': StockDataFields.stock_historical_1mo,
	'3mo': StockDataFields.stock_historical_3mo,
	'6mo': StockDataFields.stock_historical_6mo,
	'1y': StockDataFields.stock_historical_1yr,
	'5y': StockDataFields.stock_historical_5yr,
	ytd: StockDataFields.stock_historical_ytd,
	all: StockDataFields.stock_historical_all,
} as const;

export type StockDataHistoricalLoadingPeriods = '1min' | '5min' | '1hour' | '4hour' | '1day' | '1week' | '1month';
