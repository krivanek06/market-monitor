import { FirebaseNewsTypes, MarketOverviewData, MarketTopPerformanceOverview, News } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, FirebaseMarketDataFields, FirebaseNewsTypesCollectionResolver } from './models';

export const getDatabaseMarketTopPerformanceRef = () =>
  firestore()
    .collection(FirebaseMarketDataFields.market_data)
    .doc(FirebaseMarketDataFields.market_top_performance)
    .withConverter(assignTypes<MarketTopPerformanceOverview>());

export const getDatabaseMarketNewsRef = (category: FirebaseNewsTypes) =>
  firestore()
    .collection(FirebaseMarketDataFields.market_data)
    .doc(FirebaseNewsTypesCollectionResolver(category))
    .withConverter(assignTypes<DataSnapshot<News[]>>());

export const getDatabaseMarketOverviewRef = (path: string) =>
  firestore()
    .collection(FirebaseMarketDataFields.market_data)
    .doc(path)
    .withConverter(assignTypes<MarketOverviewData>());
