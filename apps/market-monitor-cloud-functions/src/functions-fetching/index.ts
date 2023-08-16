import { httpsOnRequestWrapper } from '../utils';

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
export const getstockdetails = httpsOnRequestWrapper('getStockDetailsWrapper', getStockDetailsWrapper);
export const getstockearnings = httpsOnRequestWrapper('getStockEarningsWrapper', getStockEarningsWrapper);
export const getstockhistoricalmetrics = httpsOnRequestWrapper(
  'getStockHistoricalMetricsWrapper',
  getStockHistoricalMetricsWrapper,
);

export const getstockinsidertrades = httpsOnRequestWrapper(
  'getStockInsiderTradesWrapper',
  getStockInsiderTradesWrapper,
);

export const getownershipholderstodate = httpsOnRequestWrapper(
  'getOwnershipHoldersToDateWrapper',
  getOwnershipHoldersToDateWrapper,
);

export const getownershipinstitutional = httpsOnRequestWrapper(
  'getOwnershipInstitutionalWrapper',
  getOwnershipInstitutionalWrapper,
);

export const getstockscreening = httpsOnRequestWrapper('getStockScreeningWrapper', getStockScreeningWrapper);
export const getstocksummaries = httpsOnRequestWrapper('getStockSummariesWrapper', getStockSummariesWrapper);
export const getstocksummary = httpsOnRequestWrapper('getStockScreeningWrapper', getStockSummaryWrapper);
export const searchstocksbasic = httpsOnRequestWrapper('searchStocksBasicWrapper', searchStocksBasicWrapper);

export const getquotebysymbol = httpsOnRequestWrapper('getQuoteBySymbolWrapper', getQuoteBySymbolWrapper);
export const getquotesbysymbols = httpsOnRequestWrapper('getQuotesBySymbolsWrapper', getQuotesBySymbolsWrapper);

export const getassethistoricalpricesondate = httpsOnRequestWrapper(
  'getAssetHistoricalPricesOnDateWrapper',
  getAssetHistoricalPricesOnDateWrapper,
);

export const getassethistoricalprices = httpsOnRequestWrapper(
  'getAssetHistoricalPricesWrapper',
  getAssetHistoricalPricesWrapper,
);

export const getcalendarstockdividends = httpsOnRequestWrapper(
  'getCalendarStockDividendsWrapper',
  getCalendarStockDividendsWrapper,
);

export const getcalendarstockearnigns = httpsOnRequestWrapper(
  'getCalendarStockEarnignsWrapper',
  getCalendarStockEarnignsWrapper,
);

export const getcalendarstockipos = httpsOnRequestWrapper('getCalendarStockIposWrapper', getCalendarStockIposWrapper);
export const getinstitutionalportfoliodates = httpsOnRequestWrapper(
  'getInstitutionalPortfolioDatesWrapper',
  getInstitutionalPortfolioDatesWrapper,
);

export const getmarketnews = httpsOnRequestWrapper('getMarketNewsWrapper', getMarketNewsWrapper);
export const getmarketoverview = httpsOnRequestWrapper('getMarketOverviewWrapper', getMarketOverviewWrapper);
export const getmarketoverviewdata = httpsOnRequestWrapper(
  'getMarketOverviewDataWrapper',
  getMarketOverviewDataWrapper,
);

export const getmarkettopperformance = httpsOnRequestWrapper(
  'getMarketTopPerformanceWrapper',
  getMarketTopPerformanceWrapper,
);

export const getquotesbytype = httpsOnRequestWrapper('getQuotesByTypeWrapper', getQuotesByTypeWrapper);
