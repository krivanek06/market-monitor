import { corsMiddleWare, firebaseSimpleErrorLogger } from '../utils';

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
