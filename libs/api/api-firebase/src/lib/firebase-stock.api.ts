import {
  CompanyInsideTrade,
  HistoricalPrice,
  News,
  StockDetailsAPI,
  StockMetricsHistoricalAPI,
  StockSummary,
  SymbolOwnershipHolders,
  SymbolOwnershipInstitutional,
} from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, HistoricalPriceTypes } from './models';

export const getDatabaseStockSummaryRef = (symbol: string) =>
  firestore().collection('market_data_stocks').doc(symbol).withConverter(assignTypes<StockSummary>());

export const getDatabaseStockMoreInformationRef = (symbol: string) =>
  getDatabaseStockSummaryRef(symbol).collection('more_information');

export const getDatabaseStockDetailsRef = (symbol: string) =>
  getDatabaseStockMoreInformationRef(symbol).doc('details').withConverter(assignTypes<StockDetailsAPI>());

export const getDatabaseStockMetricHistoricalRef = (symbol: string) =>
  getDatabaseStockMoreInformationRef(symbol)
    .doc('historical_metrics')
    .withConverter(assignTypes<StockMetricsHistoricalAPI>());

export const getDatabaseStockInsiderTradingRef = (symbol: string) =>
  getDatabaseStockMoreInformationRef(symbol)
    .doc('insider_trading')
    .withConverter(assignTypes<DataSnapshot<CompanyInsideTrade[]>>());

export const getDatabaseStockDetailsHistorical = (symbol: string, historical: HistoricalPriceTypes) =>
  getDatabaseStockMoreInformationRef(symbol)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());

export const getDatabaseStockDetailsNews = (symbol: string) =>
  getDatabaseStockMoreInformationRef(symbol).doc('news').withConverter(assignTypes<DataSnapshot<News[]>>());

export const getDatabaseStockOwnershipInstitutionalRef = (symbol: string) =>
  getDatabaseStockMoreInformationRef(symbol)
    .doc('ownership_institutional')
    .withConverter(assignTypes<DataSnapshot<SymbolOwnershipInstitutional[]>>());

export const getDatabaseStockOwnershipHoldersRef = (symbol: string, date: string) =>
  getDatabaseStockMoreInformationRef(symbol)
    .doc(`ownership_holders_${date}`)
    .withConverter(assignTypes<DataSnapshot<SymbolOwnershipHolders[]>>());
