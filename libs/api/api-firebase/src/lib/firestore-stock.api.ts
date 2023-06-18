import { HistoricalPrice, StockDetails, StockSummary } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, StockDataFields, StockDataHistorical } from './models';

export const getDatabaseStockSummaryRef = (symbol: string) =>
  firestore().collection(StockDataFields.stock_data).doc(symbol).withConverter(assignTypes<StockSummary>());

export const getDatabaseStockDetailsRef = (symbol: string) =>
  firestore()
    .collection(StockDataFields.stock_data)
    .doc(symbol)
    .collection(StockDataFields.more_information)
    .doc(StockDataFields.stock_details)
    .withConverter(assignTypes<StockDetails>());

export const getDatabaseStockDetailsHistorical = (symbol: string, historical: StockDataHistorical) =>
  firestore()
    .collection(StockDataFields.stock_data)
    .doc(symbol)
    .collection(StockDataFields.more_information)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());
