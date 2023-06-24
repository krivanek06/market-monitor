import { HistoricalPrice, News, StockDetails, StockSummary } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, FirebaseStockDataFields, HistoricalPriceTypes } from './models';

export const getDatabaseStockSummaryRef = (symbol: string) =>
  firestore()
    .collection(FirebaseStockDataFields.market_data_stocks)
    .doc(symbol)
    .withConverter(assignTypes<StockSummary>());

export const getDatabaseStockDetailsRef = (symbol: string) =>
  firestore()
    .collection(FirebaseStockDataFields.market_data_stocks)
    .doc(symbol)
    .collection(FirebaseStockDataFields.more_information)
    .doc(FirebaseStockDataFields.stock_details)
    .withConverter(assignTypes<StockDetails>());

export const getDatabaseStockDetailsHistorical = (symbol: string, historical: HistoricalPriceTypes) =>
  firestore()
    .collection(FirebaseStockDataFields.market_data_stocks)
    .doc(symbol)
    .collection(FirebaseStockDataFields.more_information)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());

export const getDatabaseStockDetailsNews = (symbol: string) =>
  firestore()
    .collection(FirebaseStockDataFields.market_data_stocks)
    .doc(symbol)
    .collection(FirebaseStockDataFields.more_information)
    .doc(FirebaseStockDataFields.stock_news)
    .withConverter(assignTypes<DataSnapshot<News[]>>());
