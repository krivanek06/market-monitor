import { corsMiddleWare, firebaseSimpleErrorLogger } from '../utils';

// stock-functions
import { getStockDetailsWrapper } from './stock-functions/get-stock-details';
import { getStockEarningsWrapper } from './stock-functions/get-stock-earnings';
import { getStockHistoricalMetricsWrapper } from './stock-functions/get-stock-historical-metrics-basic';
import { getStockInsiderTradesWrapper } from './stock-functions/get-stock-insider-trades';
import { getOwnershipHoldersToDateWrapper } from './stock-functions/get-stock-ownership-holders-to-date';
import { getOwnershipInstitutionalWrapper } from './stock-functions/get-stock-ownership-institutional';

// market-functions
import {
  getCalendarStockDividendsWrapper,
  getCalendarStockEarnignsWrapper,
  getCalendarStockIposWrapper,
} from './market-functions/get-calendar-stock';
import { getInstitutionalPortfolioDatesWrapper } from './market-functions/get-institutional-portfolio-dates';
import { getMarketOverviewDataWrapper, getMarketOverviewWrapper } from './market-functions/get-market-overview';
import { getMarketTopPerformanceWrapper } from './market-functions/get-market-top-performers';
import { getQuotesByTypeWrapper } from './market-functions/get-quotes-by-type';

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

export const getcalendarstockdividends = firebaseSimpleErrorLogger(
  'getCalendarStockDividendsWrapper',
  corsMiddleWare(getCalendarStockDividendsWrapper),
);

export const getcalendarstockearnigns = firebaseSimpleErrorLogger(
  'getCalendarStockEarnignsWrapper',
  corsMiddleWare(getCalendarStockEarnignsWrapper),
);

export const getcalendarstockipos = firebaseSimpleErrorLogger(
  'getCalendarStockIposWrapper',
  corsMiddleWare(getCalendarStockIposWrapper),
);
export const getinstitutionalportfoliodates = firebaseSimpleErrorLogger(
  'getInstitutionalPortfolioDatesWrapper',
  corsMiddleWare(getInstitutionalPortfolioDatesWrapper),
);

export const getmarketoverview = firebaseSimpleErrorLogger(
  'getMarketOverviewWrapper',
  corsMiddleWare(getMarketOverviewWrapper),
);
export const getmarketoverviewdata = firebaseSimpleErrorLogger(
  'getMarketOverviewDataWrapper',
  corsMiddleWare(getMarketOverviewDataWrapper),
);

export const getmarkettopperformance = firebaseSimpleErrorLogger(
  'getMarketTopPerformanceWrapper',
  corsMiddleWare(getMarketTopPerformanceWrapper),
);

export const getquotesbytype = firebaseSimpleErrorLogger(
  'getQuotesByTypeWrapper',
  corsMiddleWare(getQuotesByTypeWrapper),
);
