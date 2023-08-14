import { httpsOnRequestWrapper } from '../../utils';
import { getStockDetailsWrapper } from './get-stock-details';
import { getStockEarningsWrapper } from './get-stock-earnings';
import { getStockHistoricalMetricsWrapper } from './get-stock-historical-metrics-basic';
import { getStockInsiderTradesWrapper } from './get-stock-insider-trades';
import { getOwnershipHoldersToDateWrapper } from './get-stock-ownership-holders-to-date';
import { getOwnershipInstitutionalWrapper } from './get-stock-ownership-institutional';
import { getStockScreeningWrapper } from './get-stock-screening';
import { getStockSummariesWrapper, getStockSummaryWrapper } from './get-stock-summary';
import { searchStocksBasicWrapper } from './search-stock-basic';

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
