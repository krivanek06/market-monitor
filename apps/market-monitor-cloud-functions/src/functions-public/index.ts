import { corsMiddleWare, firebaseSimpleErrorLogger } from '../utils';
import {
  getMarketOverviewDataWrapper,
  run_reload_market_overview as run_reload_market_overview_wrapper,
} from './market-functions/market-overview';

// stock-functions
import { getStockDetailsWrapper } from './stock-functions/get-stock-details';
import { getStockEarningsWrapper } from './stock-functions/get-stock-earnings';
import { getStockHistoricalMetricsWrapper } from './stock-functions/get-stock-historical-metrics-basic';
import { getStockInsiderTradesWrapper } from './stock-functions/get-stock-insider-trades';
import { getOwnershipHoldersToDateWrapper } from './stock-functions/get-stock-ownership-holders-to-date';
import { getOwnershipInstitutionalWrapper } from './stock-functions/get-stock-ownership-institutional';

// wrap functions with sentry
export const getstockdetails = firebaseSimpleErrorLogger(
  'getStockDetailsWrapper',
  corsMiddleWare(getStockDetailsWrapper),
);
export const getstockearnings = firebaseSimpleErrorLogger(
  'getStockEarningsWrapper',
  corsMiddleWare(getStockEarningsWrapper),
);
export const getstockhistoricalmetrics = firebaseSimpleErrorLogger(
  'getStockHistoricalMetricsWrapper',
  corsMiddleWare(getStockHistoricalMetricsWrapper),
);

export const getstockinsidertrades = firebaseSimpleErrorLogger(
  'getStockInsiderTradesWrapper',
  corsMiddleWare(getStockInsiderTradesWrapper),
);

export const getownershipholderstodate = firebaseSimpleErrorLogger(
  'getOwnershipHoldersToDateWrapper',
  corsMiddleWare(getOwnershipHoldersToDateWrapper),
);

export const getownershipinstitutional = firebaseSimpleErrorLogger(
  'getOwnershipInstitutionalWrapper',
  corsMiddleWare(getOwnershipInstitutionalWrapper),
);

export const run_reload_market_overview = run_reload_market_overview_wrapper;

export const getmarketoverviewdata = firebaseSimpleErrorLogger(
  'getMarketOverviewDataWrapper',
  corsMiddleWare(getMarketOverviewDataWrapper),
);
