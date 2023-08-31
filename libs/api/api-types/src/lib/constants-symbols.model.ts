export type HistoricalLoadingPeriods = '1min' | '5min' | '1hour' | '4hour' | '1day' | '1week' | '1month';

export const SYMBOL_SP500 = '^GSPC';
export const SYMBOL_DOW_JONES = '^DJI';
export const SYMBOL_NASDAQ = '^IXIC';
export const SYMBOL_RUSSELL_2000 = '^RUT';

export const INDEXES_DEFAULT = [
  {
    name: 'S&P 500',
    symbol: SYMBOL_SP500,
  },
  {
    name: 'Dow Jones',
    symbol: SYMBOL_DOW_JONES,
  },
  {
    name: 'Nasdaq',
    symbol: SYMBOL_NASDAQ,
  },
  {
    name: 'Russell 2000',
    symbol: SYMBOL_RUSSELL_2000,
  },
];

export const INDEXES_DEFAULT_SYMBOLS = INDEXES_DEFAULT.map((index) => index.symbol);

export enum DataTimePeriodEnum {
  QUARTER = 'quarter',
  YEAR = 'year',
}
export type DataTimePeriod = `${DataTimePeriodEnum}`;

// create response header
export const RESPONSE_HEADER = {
  status: 200,
  headers: {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'content-type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  },
} satisfies ResponseInit;
