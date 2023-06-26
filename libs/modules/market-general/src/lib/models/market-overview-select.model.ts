import { MARKET_OVERVIEW_DATABASE_KEYS } from '@market-monitor/api-firebase';

export const MARKET_OVERVIEW_DATA = [
  {
    name: 'S&P 500',
    key: 'sp500',
    data: [
      {
        name: 'S&P 500 - PE ratio',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.peRatio.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Shiller PE',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.shillerPeRatio.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Book value',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.bookValue.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Price to book',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToBook.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Sales',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.sales.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Sales growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.salesGrowth.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Price to sale',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToSales.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Earnings',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earnings.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Earnings growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsGrowth.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Earnings yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsYield.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Dividend yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendYield.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Dividend',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividend.document,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Dividend growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendGrowth.document,
        provider: 'quandl',
      },
    ],
  },
  {
    name: 'Bonds',
    key: 'bonds',
    data: [
      {
        name: 'Bond - US AAA yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAAYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - US AA yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - US A yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - US BB yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBBYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - US B yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - US CCC yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCCCYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - US Corporate yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCorporateYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - US high yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usHighYield.document,
        provider: 'quandl',
      },
      {
        name: 'Bond - Emerging markets high yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usEmergingMarket.document,
        provider: 'quandl',
      },
    ],
  },
  {
    name: 'Treasury yield',
    key: 'treasury_yield',
    data: [
      {
        name: 'Treasury yield 1 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Month.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 2 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Month.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 3 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Month.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 6 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us6Month.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 1 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Year.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 2 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Year.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 3 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Year.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 5 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us5Year.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 7 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us7Year.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 10 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us10Year.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 20 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us20Year.document,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 30 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us30Year.document,
        provider: 'quandl',
      },
    ],
  },
  {
    name: 'Consumer price index states',
    key: 'consumer_price_index_states',
    data: [
      {
        name: 'Consumer price index - USA',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.usCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Europe',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.euCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - UK',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.ukCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Japan',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.jpCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Canada',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.caCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Switzerland',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.cheCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Russia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.rusCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Australia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.ausCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Germany',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.gerCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - France',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.fraCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Italy',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.itaCpi.document,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - New Zealand',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.nzlCpi.document,
        provider: 'quandl',
      },
    ],
  },
  {
    name: 'Inflation rate',
    key: 'inflation_rate',
    data: [
      {
        name: 'Inflation YOY - USA',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.usInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Europe',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.euInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - UK',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ukInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Canada',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.caInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Japan',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.jpInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Switzerland',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.cheInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Russia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.rusInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Australia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ausInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Germany',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.gerInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - France',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.fraInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Italy',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.itaInflationRate.document,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - New Zealand',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.nzlInflationRate.document,
        provider: 'quandl',
      },
    ],
  },
  {
    name: 'Bitcoin',
    key: 'bitcoin',
    data: [
      {
        name: 'Market cap',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.marketCap.document,
        provider: 'quandl',
      },
      {
        name: 'Traiding volume',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.tradingVolume.document,
        provider: 'quandl',
      },
      {
        name: 'Transaction fees',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionFees.document,
        provider: 'quandl',
      },
      {
        name: 'Transaction time',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionTime.document,
        provider: 'quandl',
      },
      {
        name: 'Transaction cost',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionCost.document,
        provider: 'quandl',
      },
      {
        name: 'Daily transactions',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.dailyTransactions.document,
        provider: 'quandl',
      },
    ],
  },
] as const;
