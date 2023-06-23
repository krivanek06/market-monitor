import { MarketTopPerformanceOverview, News } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import {
  DataSnapshot,
  FirebaseMarketDataFields,
  FirebaseNewsTypes,
  FirebaseNewsTypesCollectionResolver,
} from './models';

export const getDatabaseMarketOverviewRef = () =>
  firestore()
    .collection(FirebaseMarketDataFields.market_data)
    .doc(FirebaseMarketDataFields.market_top_performance)
    .withConverter(assignTypes<MarketTopPerformanceOverview>());

export const getDatabaseMarketNewsRef = (category: FirebaseNewsTypes) =>
  firestore()
    .collection(FirebaseMarketDataFields.market_data)
    .doc(FirebaseNewsTypesCollectionResolver(category))
    .withConverter(assignTypes<DataSnapshot<News[]>>());
