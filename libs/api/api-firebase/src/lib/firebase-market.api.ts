import { MarketTopPerformanceOverview } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { FirebaseMarketDataFields } from './models';

export const getDatabaseMarketOverviewRef = () =>
  firestore()
    .collection(FirebaseMarketDataFields.market_data)
    .doc(FirebaseMarketDataFields.market_top_performance)
    .withConverter(assignTypes<MarketTopPerformanceOverview>());
