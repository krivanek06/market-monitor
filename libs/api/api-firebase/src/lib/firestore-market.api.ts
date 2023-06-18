import { MarketOverview } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { MarketDataFields } from './models';

export const getDatabaseMarketOverviewRef = () =>
  firestore()
    .collection(MarketDataFields.market_data)
    .doc(MarketDataFields.market_overview)
    .withConverter(assignTypes<MarketOverview>());
