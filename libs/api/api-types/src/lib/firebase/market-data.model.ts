import { ChartDataType } from '../constants';
import { SymbolQuote } from '../external-api';

export type MarketTopPerformance<T> = {
  stockTopGainers: T[];
  stockTopLosers: T[];
  stockTopActive: T[];
};

export type MarketTopPerformanceSymbols = MarketTopPerformance<string> & {};

export type MarketTopPerformanceOverviewResponse = MarketTopPerformance<SymbolQuote> & {};

// ------------------ News ------------------

export const NewsAcceptableTypes = ['general', 'stocks', 'forex', 'crypto'] as const;
export type NewsTypes = (typeof NewsAcceptableTypes)[number];

// ------------------ Market Overview ------------------
export const MARKET_OVERVIEW_ENDPOINTS = {
  general: {
    name: 'General',
    provider: 'financialmodelingprep',
    data: [
      {
        key: 'GDP',
        name: 'GDP',
        keyReadable: 'GDP',
      },
      {
        key: 'realGDP',
        name: 'Real GDP',
        keyReadable: 'realGDP',
      },
      {
        key: 'nominalPotentialGDP',
        name: 'Potential GDP',
        keyReadable: 'nominalPotentialGDP',
      },
      {
        key: 'realGDPPerCapita',
        name: 'GDP per capita',
        keyReadable: 'realGDPPerCapita',
      },
      {
        key: 'federalFunds',
        name: 'Federal funds',
        keyReadable: 'federalFunds',
      },
      {
        key: 'CPI',
        name: 'CPI',
        keyReadable: 'CPI',
      },
      {
        key: 'inflationRate',
        name: 'Inflation Rate',
        keyReadable: 'inflationRate',
      },
      {
        key: 'inflation',
        name: 'Inflation',
        keyReadable: 'inflation',
      },
      {
        key: 'retailSales',
        name: 'Retail Sales',
        keyReadable: 'retailSales',
      },
      {
        key: 'consumerSentiment',
        name: 'Consumer Sentiment',
        keyReadable: 'consumerSentiment',
      },
      {
        key: 'durableGoods',
        name: 'Durable Goods',
        keyReadable: 'durableGoods',
      },
      {
        key: 'unemploymentRate',
        name: 'Unemployment Rate',
        keyReadable: 'unemploymentRate',
      },
      {
        key: 'totalNonfarmPayroll',
        name: 'Non-Farm Payroll',
        keyReadable: 'totalNonfarmPayroll',
      },
      {
        key: 'initialClaims',
        name: 'Initial Claims',
        keyReadable: 'initialClaims',
      },
      {
        key: 'industrialProductionTotalIndex',
        name: 'Industrial Production',
        keyReadable: 'industrialProductionTotalIndex',
      },
      {
        key: 'newPrivatelyOwnedHousingUnitsStartedTotalUnits',
        name: 'Housing Units Started',
        keyReadable: 'newPrivatelyOwnedHousingUnitsStartedTotalUnits',
      },
      {
        key: 'totalVehicleSales',
        name: 'Vehicle Sales',
        keyReadable: 'totalVehicleSales',
      },
      {
        key: 'retailMoneyFunds',
        name: 'Money Funds',
        keyReadable: 'retailMoneyFunds',
      },
      {
        key: 'smoothedUSRecessionProbabilities',
        name: 'Recession Probabilities',
        keyReadable: 'smoothedUSRecessionProbabilities',
      },
      {
        key: '3MonthOr90DayRatesAndYieldsCertificatesOfDeposit',
        name: '3 Month Rates',
        keyReadable: '3MonthOr90DayRatesAndYieldsCertificatesOfDeposit',
      },
      {
        key: 'commercialBankInterestRateOnCreditCardPlansAllAccounts',
        name: 'Credit Card Interest Rate',
        keyReadable: 'commercialBankInterestRateOnCreditCardPlansAllAccounts',
      },
      {
        key: '30YearFixedRateMortgageAverage',
        name: '30 Year Mortgage',
        keyReadable: '30YearFixedRateMortgageAverage',
      },
      {
        key: '15YearFixedRateMortgageAverage',
        name: '15 Year Mortgage',
        keyReadable: '15YearFixedRateMortgageAverage',
      },
    ],
  },
  sp500: {
    name: 'S&P 500',
    provider: 'quandl',
    data: [
      {
        key: 'MULTPL/SP500_PE_RATIO_MONTH',
        name: 'PE ratio',
        keyReadable: 'peRatio',
      },
      {
        key: 'MULTPL/SHILLER_PE_RATIO_MONTH',
        name: 'Shiller PE',
        keyReadable: 'shillerPeRatio',
      },
      {
        key: 'MULTPL/SP500_BVPS_QUARTER',
        name: 'Book value',
        keyReadable: 'bookValue',
      },
      {
        key: 'MULTPL/SP500_PBV_RATIO_QUARTER',
        name: 'Price to book',
        keyReadable: 'priceToBook',
      },
      {
        key: 'MULTPL/SP500_SALES_QUARTER',
        name: 'Sales',
        keyReadable: 'sales',
      },
      {
        key: 'MULTPL/SP500_SALES_GROWTH_QUARTER',
        name: 'Sales growth',
        keyReadable: 'salesGrowth',
      },
      {
        key: 'MULTPL/SP500_PSR_QUARTER',
        name: 'Price to sale',
        keyReadable: 'priceToSales',
      },
      {
        key: 'MULTPL/SP500_EARNINGS_MONTH',
        name: 'Earnings',
        keyReadable: 'earnings',
      },
      {
        key: 'MULTPL/SP500_EARNINGS_GROWTH_QUARTER',
        name: 'Earnings growth',
        keyReadable: 'earningsGrowth',
      },
      {
        key: 'MULTPL/SP500_EARNINGS_YIELD_MONTH',
        name: 'Earnings yield',
        keyReadable: 'earningsYield',
      },
      {
        key: 'MULTPL/SP500_DIV_YIELD_MONTH',
        name: 'Dividend yield',
        keyReadable: 'dividendYield',
      },
      {
        key: 'MULTPL/SP500_DIV_MONTH',
        name: 'Dividend',
        keyReadable: 'dividend',
      },
      {
        key: 'MULTPL/SP500_DIV_GROWTH_QUARTER',
        name: 'Dividend growth',
        keyReadable: 'dividendGrowth',
      },
    ],
  },
  bonds: {
    name: 'Bonds',
    provider: 'quandl',
    data: [
      {
        key: 'ML/AAAEY',
        name: 'US AAA yield',
        keyReadable: 'usAAAYield',
      },
      {
        key: 'ML/AAY',
        name: 'US AA yield',
        keyReadable: 'usAAYield',
      },
      {
        key: 'ML/AEY',
        name: 'US A yield',
        keyReadable: 'usAYield',
      },
      {
        key: 'ML/BBY',
        name: 'US BB yield',
        keyReadable: 'usBBYield',
      },
      {
        key: 'ML/BEY',
        name: 'US B yield',
        keyReadable: 'usBYield',
      },
      {
        key: 'ML/CCCY',
        name: 'US CCC yield',
        keyReadable: 'usCCCYield',
      },
      {
        key: 'ML/USEY',
        name: 'US Corporate yield',
        keyReadable: 'usCorporateYield',
      },
      {
        key: 'ML/USTRI',
        name: 'US high yield',
        keyReadable: 'usHighYield',
      },
      {
        key: 'ML/EMHYY',
        name: 'Emerging markets high yield',
        keyReadable: 'usEmergingMarket',
      },
    ],
  },
  treasury: {
    name: 'Treasury',
    provider: 'quandl',
    data: [
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 1 MO',
        keyReadable: 'us1Month',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 2 MO',
        keyReadable: 'us2Month',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 3 MO',
        keyReadable: 'us3Month',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 6 MO',
        keyReadable: 'us6Month',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 1 YR',
        keyReadable: 'us1Year',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 2 YR',
        keyReadable: 'us2Year',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 3 YR',
        keyReadable: 'us3Year',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 5 YR',
        keyReadable: 'us5Year',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 7 YR',
        keyReadable: 'us7Year',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 10 YR',
        keyReadable: 'us10Year',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 20 YR',
        keyReadable: 'us20Year',
      },
      {
        key: 'USTREASURY/YIELD',
        name: 'yield 30 YR',
        keyReadable: 'us30Year',
      },
    ],
  },
  bitcoin: {
    name: 'Bitcoin',
    provider: 'quandl',
    data: [
      {
        key: 'BCHAIN/MKTCP',
        name: 'Market cap',
        keyReadable: 'marketCap',
      },
      {
        key: 'BCHAIN/TRVOU',
        name: 'Traiding volume',
        keyReadable: 'tradingVolume',
      },
      {
        key: 'BCHAIN/TRFUS',
        name: 'Transaction fees',
        keyReadable: 'transactionFees',
      },
      {
        key: 'BCHAIN/ATRCT',
        name: 'Transaction time',
        keyReadable: 'transactionTime',
      },
      {
        key: 'BCHAIN/CPTRA',
        name: 'Transaction cost',
        keyReadable: 'transactionCost',
      },
      {
        key: 'BCHAIN/NTRAN',
        name: 'Daily transactions',
        keyReadable: 'dailyTransactions',
      },
    ],
  },
} as const;
export type MarketOverviewKey = keyof typeof MARKET_OVERVIEW_ENDPOINTS;

export type MarketOverviewSubKey<T extends MarketOverviewKey> =
  (typeof MARKET_OVERVIEW_ENDPOINTS)[T]['data'][number]['key'];

export type MarketOverviewSubkeyReadable<T extends MarketOverviewKey> =
  (typeof MARKET_OVERVIEW_ENDPOINTS)[T]['data'][number]['keyReadable'];

export type MarketOverviewName<T extends MarketOverviewKey> =
  (typeof MARKET_OVERVIEW_ENDPOINTS)[T]['data'][number]['name'];
export type MarketOverviewProvider = (typeof MARKET_OVERVIEW_ENDPOINTS)[MarketOverviewKey]['provider'];

export type MarketOverviewBase<
  Keys extends MarketOverviewKey,
  T extends Partial<{ [K in MarketOverviewSubkeyReadable<Keys>]: ChartDataType }>,
> = { [K in Keys]: T };
export type MarketOverview = MarketOverviewBase<
  'sp500',
  {
    peRatio: ChartDataType;
    shillerPeRatio: ChartDataType;
    priceToBook: ChartDataType;
    priceToSales: ChartDataType;
    earningsYield: ChartDataType;
    dividendYield: ChartDataType;
  }
> &
  MarketOverviewBase<
    'bonds',
    {
      usAAAYield: ChartDataType;
      usAAYield: ChartDataType;
      usBBYield: ChartDataType;
      usCCCYield: ChartDataType;
      usCorporateYield: ChartDataType;
      usHighYield: ChartDataType;
      usEmergingMarket: ChartDataType;
    }
  > &
  MarketOverviewBase<
    'treasury',
    {
      us1Month: ChartDataType;
      us3Month: ChartDataType;
      us1Year: ChartDataType;
      us5Year: ChartDataType;
      us10Year: ChartDataType;
      us30Year: ChartDataType;
    }
  > &
  MarketOverviewBase<
    'general',
    {
      GDP: ChartDataType;
      realGDP: ChartDataType;
      nominalPotentialGDP: ChartDataType;
      realGDPPerCapita: ChartDataType;
      federalFunds: ChartDataType;
      CPI: ChartDataType;
      inflationRate: ChartDataType;
      inflation: ChartDataType;
      retailSales: ChartDataType;
      consumerSentiment: ChartDataType;
      durableGoods: ChartDataType;
      unemploymentRate: ChartDataType;
      totalNonfarmPayroll: ChartDataType;
      initialClaims: ChartDataType;
      industrialProductionTotalIndex: ChartDataType;
      newPrivatelyOwnedHousingUnitsStartedTotalUnits: ChartDataType;
      totalVehicleSales: ChartDataType;
      retailMoneyFunds: ChartDataType;
      smoothedUSRecessionProbabilities: ChartDataType;
      '3MonthOr90DayRatesAndYieldsCertificatesOfDeposit': ChartDataType;
      commercialBankInterestRateOnCreditCardPlansAllAccounts: ChartDataType;
      '30YearFixedRateMortgageAverage': ChartDataType;
      '15YearFixedRateMortgageAverage': ChartDataType;
    }
  >;

export const marketOverviewLoadSP500: Array<keyof MarketOverview['sp500']> = [
  'peRatio',
  'shillerPeRatio',
  'priceToSales',
  'priceToBook',
  'earningsYield',
  'dividendYield',
];

export const marketOverviewLoadBonds: Array<keyof MarketOverview['bonds']> = [
  'usAAAYield',
  'usAAYield',
  'usBBYield',
  'usCCCYield',
  'usCorporateYield',
  'usEmergingMarket',
  'usHighYield',
];

export const marketOverviewLoadTreasury: Array<keyof MarketOverview['treasury']> = [
  'us10Year',
  'us1Month',
  'us1Year',
  'us30Year',
  'us3Month',
  'us5Year',
];

export const marketOverviewLoadGeneral: Array<keyof MarketOverview['general']> = [
  'GDP',
  'realGDP',
  'nominalPotentialGDP',
  'realGDPPerCapita',
  'federalFunds',
  'CPI',
  'inflationRate',
  'inflation',
  'retailSales',
  'consumerSentiment',
  'durableGoods',
  'unemploymentRate',
  'totalNonfarmPayroll',
  'initialClaims',
  'industrialProductionTotalIndex',
  'newPrivatelyOwnedHousingUnitsStartedTotalUnits',
  'totalVehicleSales',
  'retailMoneyFunds',
  'smoothedUSRecessionProbabilities',
  '3MonthOr90DayRatesAndYieldsCertificatesOfDeposit',
  'commercialBankInterestRateOnCreditCardPlansAllAccounts',
  '30YearFixedRateMortgageAverage',
  '15YearFixedRateMortgageAverage',
];

type MarketOverviewTypes<T extends MarketOverviewKey> = {
  name: string;
  key: T;
  subkeys: MarketOverviewSubkeyReadable<T>[];
};

// export const MARKET_OVERVIEW_DATA: [
//   MarketOverviewTypes<'sp500'>,
//   MarketOverviewTypes<'bonds'>,
//   MarketOverviewTypes<'treasury'>,
//   MarketOverviewTypes<'general'>,
// ] = [
//   {
//     name: 'S&P 500',
//     key: 'sp500',
//     subkeys: marketOverviewLoadSP500,
//   },
//   {
//     name: 'Bonds',
//     key: 'bonds',
//     subkeys: marketOverviewLoadBonds
//   },
//   {
//     name: 'Treasury',
//     key: 'treasury',
//     subkeys: marketOverviewLoadTreasury
//   },
//   {
//     name: 'General',
//     key: 'general',
//     subkeys: marketOverviewLoadGeneral
//   },
// ];
