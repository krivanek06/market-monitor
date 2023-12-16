import { corsMiddleWareHttp, firebaseSimpleErrorLogger } from '../utils';
import { getMarketOverviewDataWrapper } from './market-overview';

export const getmarketoverviewdata = firebaseSimpleErrorLogger(
  'getMarketOverviewDataWrapper',
  corsMiddleWareHttp(getMarketOverviewDataWrapper),
);
