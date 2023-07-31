import {
  CalendarStockEarning,
  CalendarStockIPO,
  CompanyStockDividend,
  FirebaseNewsTypes,
  MarketOverview,
  MarketOverviewData,
  MarketTopPerformanceOverview,
  News,
} from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, FirebaseNewsTypesCollectionResolver } from './models';

export const getDatabaseMarketDataRef = () => firestore().collection('market_data');

export const getDatabaseMarketTopPerformanceRef = () =>
  getDatabaseMarketDataRef().doc('market_top_performance').withConverter(assignTypes<MarketTopPerformanceOverview>());

export const getDatabaseMarketNewsRef = (category: FirebaseNewsTypes) =>
  getDatabaseMarketDataRef()
    .doc(FirebaseNewsTypesCollectionResolver(category))
    .withConverter(assignTypes<DataSnapshot<News[]>>());

export const getDatabaseMarketOverviewRef = () =>
  getDatabaseMarketDataRef().doc('market_overview').withConverter(assignTypes<MarketOverview>());

export const getDatabaseInstitutionalPortfolioDatesRef = () =>
  getDatabaseMarketDataRef().doc('institutional_portfolio_dates').withConverter(assignTypes<DataSnapshot<string[]>>());

export const getDatabaseMarketOverviewDataRef = (path: string) =>
  getDatabaseMarketDataRef().doc(path).withConverter(assignTypes<MarketOverviewData>());

export const getDatabaseMarketCalendarDividendsRef = (month: string | number, year: string | number) =>
  firestore()
    .collection('market_data_calendar_dividends')
    .doc(`${year}-${month}`)
    .withConverter(assignTypes<DataSnapshot<CompanyStockDividend[]>>());

export const getDatabaseMarketCalendarIPOsRef = (month: string | number, year: string | number) =>
  firestore()
    .collection('market_data_calendar_ipos')
    .doc(`${year}-${month}`)
    .withConverter(assignTypes<DataSnapshot<CalendarStockIPO[]>>());

export const getDatabaseMarketCalendarEarningsRef = (month: string | number, year: string | number) =>
  firestore()
    .collection('market_data_calendar_earnings')
    .doc(`${year}-${month}`)
    .withConverter(assignTypes<DataSnapshot<CalendarStockEarning[]>>());
