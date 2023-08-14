import { httpsOnRequestWrapper } from '../../utils';
import { getAssetHistoricalPricesOnDateWrapper, getAssetHistoricalPricesWrapper } from './get-asset-historical-prices';
import {
  getCalendarStockDividendsWrapper,
  getCalendarStockEarnignsWrapper,
  getCalendarStockIposWrapper,
} from './get-calendar-stock';
import { getInstitutionalPortfolioDatesWrapper } from './get-institutional-portfolio-dates';
import { getMarketNewsWrapper } from './get-market-news';
import { getMarketOverviewDataWrapper, getMarketOverviewWrapper } from './get-market-overview';
import { getMarketTopPerformanceWrapper } from './get-market-top-performers';
import { getQuoteBySymbolWrapper, getQuotesBySymbolsWrapper } from './get-quote';
import { getQuotesByTypeWrapper } from './get-quotes-by-type';

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
