import { MarketOverview } from '@market-monitor/shared-types';
import { firestore } from 'firebase-admin';
import { MarketDataFields } from '../model';
import { assignTypes } from '../utils';

export const getDatabaseMarketOverviewRef = () =>
  firestore()
    .collection(MarketDataFields.market_data)
    .doc(MarketDataFields.market_overview)
    .withConverter(assignTypes<MarketOverview>());
