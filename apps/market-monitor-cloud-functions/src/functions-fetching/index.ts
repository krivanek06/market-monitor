import { corsMiddleWare, sentryHttpsOnRequestWrapper } from '../utils';

// stock-functions
import { getStockDetailsWrapper } from './stock-functions/get-stock-details';
import { getStockEarningsWrapper } from './stock-functions/get-stock-earnings';
import { getStockHistoricalMetricsWrapper } from './stock-functions/get-stock-historical-metrics-basic';
import { getStockInsiderTradesWrapper } from './stock-functions/get-stock-insider-trades';
import { getOwnershipHoldersToDateWrapper } from './stock-functions/get-stock-ownership-holders-to-date';
import { getOwnershipInstitutionalWrapper } from './stock-functions/get-stock-ownership-institutional';
import { getStockScreeningWrapper } from './stock-functions/get-stock-screening';
import { getStockSummariesWrapper, getStockSummaryWrapper } from './stock-functions/get-stock-summary';
import { searchStocksBasicWrapper } from './stock-functions/search-stock-basic';

// market-functions
import {
  getAssetHistoricalPricesOnDateWrapper,
  getAssetHistoricalPricesWrapper,
} from './market-functions/get-asset-historical-prices';
import {
  getCalendarStockDividendsWrapper,
  getCalendarStockEarnignsWrapper,
  getCalendarStockIposWrapper,
} from './market-functions/get-calendar-stock';
import { getInstitutionalPortfolioDatesWrapper } from './market-functions/get-institutional-portfolio-dates';
import { getMarketNewsWrapper } from './market-functions/get-market-news';
import { getMarketOverviewDataWrapper, getMarketOverviewWrapper } from './market-functions/get-market-overview';
import { getMarketTopPerformanceWrapper } from './market-functions/get-market-top-performers';
import { getQuoteBySymbolWrapper, getQuotesBySymbolsWrapper } from './market-functions/get-quote';
import { getQuotesByTypeWrapper } from './market-functions/get-quotes-by-type';

// wrap functions with sentry
export const getstockdetails = sentryHttpsOnRequestWrapper(
  'getStockDetailsWrapper',
  corsMiddleWare(getStockDetailsWrapper),
);
export const getstockearnings = sentryHttpsOnRequestWrapper(
  'getStockEarningsWrapper',
  corsMiddleWare(getStockEarningsWrapper),
);
export const getstockhistoricalmetrics = sentryHttpsOnRequestWrapper(
  'getStockHistoricalMetricsWrapper',
  corsMiddleWare(getStockHistoricalMetricsWrapper),
);

export const getstockinsidertrades = sentryHttpsOnRequestWrapper(
  'getStockInsiderTradesWrapper',
  corsMiddleWare(getStockInsiderTradesWrapper),
);

export const getownershipholderstodate = sentryHttpsOnRequestWrapper(
  'getOwnershipHoldersToDateWrapper',
  corsMiddleWare(getOwnershipHoldersToDateWrapper),
);

export const getownershipinstitutional = sentryHttpsOnRequestWrapper(
  'getOwnershipInstitutionalWrapper',
  corsMiddleWare(getOwnershipInstitutionalWrapper),
);

export const getstockscreening = sentryHttpsOnRequestWrapper(
  'getStockScreeningWrapper',
  corsMiddleWare(getStockScreeningWrapper),
);
export const getstocksummaries = sentryHttpsOnRequestWrapper(
  'getStockSummariesWrapper',
  corsMiddleWare(getStockSummariesWrapper),
);
export const getstocksummary = sentryHttpsOnRequestWrapper(
  'getStockScreeningWrapper',
  corsMiddleWare(getStockSummaryWrapper),
);
export const searchstocksbasic = sentryHttpsOnRequestWrapper(
  'searchStocksBasicWrapper',
  corsMiddleWare(searchStocksBasicWrapper),
);

export const getquotebysymbol = sentryHttpsOnRequestWrapper(
  'getQuoteBySymbolWrapper',
  corsMiddleWare(getQuoteBySymbolWrapper),
);
export const getquotesbysymbols = sentryHttpsOnRequestWrapper(
  'getQuotesBySymbolsWrapper',
  corsMiddleWare(getQuotesBySymbolsWrapper),
);

export const getassethistoricalpricesondate = sentryHttpsOnRequestWrapper(
  'getAssetHistoricalPricesOnDateWrapper',
  corsMiddleWare(getAssetHistoricalPricesOnDateWrapper),
);

export const getassethistoricalprices = sentryHttpsOnRequestWrapper(
  'getAssetHistoricalPricesWrapper',
  corsMiddleWare(getAssetHistoricalPricesWrapper),
);

export const getcalendarstockdividends = sentryHttpsOnRequestWrapper(
  'getCalendarStockDividendsWrapper',
  corsMiddleWare(getCalendarStockDividendsWrapper),
);

export const getcalendarstockearnigns = sentryHttpsOnRequestWrapper(
  'getCalendarStockEarnignsWrapper',
  corsMiddleWare(getCalendarStockEarnignsWrapper),
);

export const getcalendarstockipos = sentryHttpsOnRequestWrapper(
  'getCalendarStockIposWrapper',
  corsMiddleWare(getCalendarStockIposWrapper),
);
export const getinstitutionalportfoliodates = sentryHttpsOnRequestWrapper(
  'getInstitutionalPortfolioDatesWrapper',
  corsMiddleWare(getInstitutionalPortfolioDatesWrapper),
);

export const getmarketnews = sentryHttpsOnRequestWrapper('getMarketNewsWrapper', corsMiddleWare(getMarketNewsWrapper));
export const getmarketoverview = sentryHttpsOnRequestWrapper(
  'getMarketOverviewWrapper',
  corsMiddleWare(getMarketOverviewWrapper),
);
export const getmarketoverviewdata = sentryHttpsOnRequestWrapper(
  'getMarketOverviewDataWrapper',
  corsMiddleWare(getMarketOverviewDataWrapper),
);

export const getmarkettopperformance = sentryHttpsOnRequestWrapper(
  'getMarketTopPerformanceWrapper',
  corsMiddleWare(getMarketTopPerformanceWrapper),
);

export const getquotesbytype = sentryHttpsOnRequestWrapper(
  'getQuotesByTypeWrapper',
  corsMiddleWare(getQuotesByTypeWrapper),
);
