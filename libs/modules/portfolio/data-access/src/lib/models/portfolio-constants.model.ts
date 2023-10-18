import { InputSource } from '@market-monitor/shared/data-access';

export const HISTORICAL_PRICE_RESTRICTION_YEARS = 6;
export const TRANSACTION_FEE_PRCT = 0.1;

// user
export const USER_NOT_NOT_FOUND_ERROR = 'User not found';
export const USER_NOT_ENOUGH_CASH_ERROR = 'Not enough cash on hand';
export const USER_NOT_UNITS_ON_HAND_ERROR = 'Not enough units on hand';

// symbol
export const SYMBOL_NOT_FOUND_ERROR = 'Symbol not found';

// transaction
export const TRANSACTION_HISTORY_NOT_FOUND_ERROR = 'No transaction history found';
export const TRANSACTION_INPUT_UNITS_POSITIVE = 'Units must be positive';
export const TRANSACTION_INPUT_UNITS_INTEGER = 'Units must be integer';

// date
export const DATE_INVALID_DATE = 'Invalid date';
export const DATE_WEEKEND = 'Weekend date not allowed';
export const DATE_FUTURE = 'Future date not allowed';
export const DATE_TOO_OLD = 'Date too old';

export type DashboardChartTypes = 'PortfolioGrowth' | 'PortfolioChange' | 'PortfolioAssets';
export const dashboardChartOptionsInputSource: InputSource<{
  caption: string;
  value: DashboardChartTypes;
}>[] = [
  {
    caption: 'Portfolio Growth',
    value: {
      caption: 'Portfolio Growth',
      value: 'PortfolioGrowth',
    },
  },
  {
    caption: 'Portfolio Change',
    value: {
      caption: 'Portfolio Change',
      value: 'PortfolioChange',
    },
  },
  {
    caption: 'Portfolio Assets',
    value: {
      caption: 'Portfolio Assets',
      value: 'PortfolioAssets',
    },
  },
];
