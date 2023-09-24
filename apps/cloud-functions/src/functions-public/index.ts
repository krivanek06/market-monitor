import { corsMiddleWare, firebaseSimpleErrorLogger } from '../utils';
import {
  getMarketOverviewDataWrapper,
  run_reload_market_overview as run_reload_market_overview_wrapper,
} from './market-functions/market-overview';

// wrap functions with sentry
export const getmarketoverviewdata = firebaseSimpleErrorLogger(
  'getMarketOverviewDataWrapper',
  corsMiddleWare(getMarketOverviewDataWrapper),
);

export const run_reload_market_overview = run_reload_market_overview_wrapper;
