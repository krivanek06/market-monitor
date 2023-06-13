import {
  HistoricalPrice,
  StockDetails,
  StockSummary,
} from '@market-monitor/shared-types';
import { firestore } from 'firebase-admin';
import { DataSnapshot, StockDataFields, StockDataHistorical } from '../model';
import { assignTypes } from '../utils';

export const getDatabaseStockSummaryRef = (symbol: string) =>
  firestore()
    .collection(StockDataFields.stock_data)
    .doc(symbol)
    .withConverter(assignTypes<StockSummary>());

export const getDatabaseStockDetailsRef = (symbol: string) =>
  firestore()
    .collection(StockDataFields.stock_data)
    .doc(symbol)
    .collection(StockDataFields.more_information)
    .doc(StockDataFields.stock_details)
    .withConverter(assignTypes<StockDetails>());

export const getDatabaseStockDetailsHistorical = (
  symbol: string,
  historical: StockDataHistorical
) =>
  firestore()
    .collection(StockDataFields.stock_data)
    .doc(symbol)
    .collection(StockDataFields.more_information)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());
