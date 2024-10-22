export const HistoricalPricePeriodsArray = ['1d', '1w', '1mo', '3mo', '6mo', '1y', '5y', 'ytd', 'all'] as const;
export type HistoricalPricePeriods = (typeof HistoricalPricePeriodsArray)[number];
export type HistoricalLoadingPeriods = '1min' | '5min' | '1hour' | '4hour' | '1day' | '1week' | '1month';
export type HistoricalLoadingPeriodsDates = {
  userPeriod: HistoricalPricePeriods;
  loadingPeriod: HistoricalLoadingPeriods;
  from: string;
  to: string;
};

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

export type ChartDataType = [string, number][];

export const STOCK_SYMBOLS = [
  'AAPL',
  'AMZN',
  'GOOGL',
  'MSFT',
  'TSLA',
  'META',
  'NVDA',
  'BABA',
  'JPM',
  'V',
  'PYPL',
  'GS',
  'INTC',
  'CSCO',
  'IBM',
  'DIS',
  'BA',
  'WMT',
  'VZ',
  'PEP',
  'PFE',
  'WFC',
  'BAC',
  'C',
  'GS',
  'MS',
  'UPS',
  'FDX',
  'HD',
  'LOW',
  'COST',
  'TGT',
  'WBA',
  'CVS',
  'ABT',
  'JNJ',
  'AZN',
  'PFE',
  'T',
  'VZ',
  'TMUS',
  'S',
  'NFLX',
  'EA',
  'SNE',
  'AMD',
  'MU',
  'QCOM',
  'AAPL',
  'TSM',
  'ADBE',
  'ORCL',
  'CRM',
  'AMAT',
  'CSCO',
  'IBM',
  'NOW',
  'SNOW',
  'ZM',
  'UBER',
];
