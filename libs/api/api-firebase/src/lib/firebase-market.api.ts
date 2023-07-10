import {
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

export const getDatabaseMarketOverviewDataRef = (path: string) =>
  getDatabaseMarketDataRef().doc(path).withConverter(assignTypes<MarketOverviewData>());
