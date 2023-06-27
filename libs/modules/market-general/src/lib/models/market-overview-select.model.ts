import { MARKET_OVERVIEW_DATABASE_KEYS } from '@market-monitor/api-types';
export const MARKET_OVERVIEW_DATA = [
  {
    name: 'S&P 500',
    key: 'sp500',
    data: [
      {
        name: 'S&P 500 - PE ratio',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.peRatio,
      },
      {
        name: 'S&P 500 - Shiller PE',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.shillerPeRatio,
      },
      {
        name: 'S&P 500 - Book value',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.bookValue,
      },
      {
        name: 'S&P 500 - Price to book',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToBook,
      },
      {
        name: 'S&P 500 - Sales',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.sales,
      },
      {
        name: 'S&P 500 - Sales growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.salesGrowth,
      },
      {
        name: 'S&P 500 - Price to sale',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToSales,
      },
      {
        name: 'S&P 500 - Earnings',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earnings,
      },
      {
        name: 'S&P 500 - Earnings growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsGrowth,
      },
      {
        name: 'S&P 500 - Earnings yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsYield,
      },
      {
        name: 'S&P 500 - Dividend yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendYield,
      },
      {
        name: 'S&P 500 - Dividend',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividend,
      },
      {
        name: 'S&P 500 - Dividend growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendGrowth,
      },
    ],
  },
  {
    name: 'Bonds',
    key: 'bonds',
    data: [
      {
        name: 'Bond - US AAA yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAAYield,
      },
      {
        name: 'Bond - US AA yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAYield,
      },
      {
        name: 'Bond - US A yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAYield,
      },
      {
        name: 'Bond - US BB yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBBYield,
      },
      {
        name: 'Bond - US B yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBYield,
      },
      {
        name: 'Bond - US CCC yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCCCYield,
      },
      {
        name: 'Bond - US Corporate yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCorporateYield,
      },
      {
        name: 'Bond - US high yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usHighYield,
      },
      {
        name: 'Bond - Emerging markets high yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usEmergingMarket,
      },
    ],
  },
  {
    name: 'Treasury yield',
    key: 'treasury_yield',
    data: [
      {
        name: 'Treasury yield 1 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Month,
      },
      {
        name: 'Treasury yield 2 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Month,
      },
      {
        name: 'Treasury yield 3 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Month,
      },
      {
        name: 'Treasury yield 6 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us6Month,
      },
      {
        name: 'Treasury yield 1 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Year,
      },
      {
        name: 'Treasury yield 2 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Year,
      },
      {
        name: 'Treasury yield 3 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Year,
      },
      {
        name: 'Treasury yield 5 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us5Year,
      },
      {
        name: 'Treasury yield 7 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us7Year,
      },
      {
        name: 'Treasury yield 10 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us10Year,
      },
      {
        name: 'Treasury yield 20 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us20Year,
      },
      {
        name: 'Treasury yield 30 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us30Year,
      },
    ],
  },
  {
    name: 'Consumer price index states',
    key: 'consumer_price_index_states',
    data: [
      {
        name: 'Consumer price index - USA',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.usCpi,
      },
      {
        name: 'Consumer price index - Europe',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.euCpi,
      },
      {
        name: 'Consumer price index - UK',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.ukCpi,
      },
      {
        name: 'Consumer price index - Japan',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.jpCpi,
      },
      {
        name: 'Consumer price index - Canada',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.caCpi,
      },
      {
        name: 'Consumer price index - Switzerland',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.cheCpi,
      },
      {
        name: 'Consumer price index - Russia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.rusCpi,
      },
      {
        name: 'Consumer price index - Australia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.ausCpi,
      },
      {
        name: 'Consumer price index - Germany',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.gerCpi,
      },
      {
        name: 'Consumer price index - France',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.fraCpi,
      },
      {
        name: 'Consumer price index - Italy',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.itaCpi,
      },
      {
        name: 'Consumer price index - New Zealand',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.nzlCpi,
      },
    ],
  },
  {
    name: 'Inflation rate',
    key: 'inflation_rate',
    data: [
      {
        name: 'Inflation YOY - USA',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.usInflationRate,
      },
      {
        name: 'Inflation YOY - Europe',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.euInflationRate,
      },
      {
        name: 'Inflation YOY - UK',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ukInflationRate,
      },
      {
        name: 'Inflation YOY - Canada',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.caInflationRate,
      },
      {
        name: 'Inflation YOY - Japan',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.jpInflationRate,
      },
      {
        name: 'Inflation YOY - Switzerland',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.cheInflationRate,
      },
      {
        name: 'Inflation YOY - Russia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.rusInflationRate,
      },
      {
        name: 'Inflation YOY - Australia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ausInflationRate,
      },
      {
        name: 'Inflation YOY - Germany',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.gerInflationRate,
      },
      {
        name: 'Inflation YOY - France',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.fraInflationRate,
      },
      {
        name: 'Inflation YOY - Italy',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.itaInflationRate,
      },
      {
        name: 'Inflation YOY - New Zealand',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.nzlInflationRate,
      },
    ],
  },
  {
    name: 'Bitcoin',
    key: 'bitcoin',
    data: [
      {
        name: 'Market cap',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.marketCap,
      },
      {
        name: 'Traiding volume',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.tradingVolume,
      },
      {
        name: 'Transaction fees',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionFees,
      },
      {
        name: 'Transaction time',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionTime,
      },
      {
        name: 'Transaction cost',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionCost,
      },
      {
        name: 'Daily transactions',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.dailyTransactions,
      },
    ],
  },
] as const;
