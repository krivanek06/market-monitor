export type MarketOverviewDocumentStructure = {
  name: string;
  key: string;
  data: MarketOverviewDocumentStructureData[];
};
export type MarketOverviewDocumentStructureData = {
  endpoint: string;
  name: string;
  databaseKey: string;
  provider: string;
};

export const MARKET_OVERVIEW_DATABASE_KEYS = {
  sp500: {
    peRatio: 'qundal_sp_500_pe_ratio_by_month_value',
    shillerPeRatio: 'qundal_shiller_pe_ratio_by_month_value',
    bookValue: 'qundal_sp_500_book_value_per_share_by_quarter_value',
    priceToBook: 'qundal_sp_500_price_to_book_value_by_quarter_value',
    sales: 'qundal_sp_500_real_sales_by_quarter_value',
    salesGrowth: 'qundal_sp_500_real_sales_growth_by_quarter_value',
    priceToSales: 'qundal_sp_500_price_to_sales_ratio_by_quarter_value',
    earnings: 'qundal_sp_500_earnings_by_month_value',
    earningsGrowth: 'qundal_sp_500_earnings_growth_rate_by_quarter_value',
    earningsYield: 'qundal_sp_500_earnings_yield_by_month_value',
    dividendYield: 'qundal_sp_500_dividend_yield_by_month_value',
    dividend: 'qundal_sp_500_dividend_by_month_value',
    dividendGrowth: 'qundal_sp_500_dividend_growth_by_quarter_value',
  },
  bonds: {
    usAAAYield: 'qundal_us_aaa_rated_bond_index_yield_bamlc0a1caaaey',
    usAAYield: 'qundal_us_aa_bond_index_yield_bamlc0a2caaey',
    usAYield: 'qundal_us_corporate_bond_a_rated_index_yield_bamlc0a3caey',
    usBBYield: 'qundal_us_high_yield_bb_corporate_bond_index_yield_bamlh0a1hybbey',
    usBYield: 'qundal_us_b_rated_corporate_bond_index_yield_bamlh0a2hybey',
    usCCCYield: 'qundal_us_cccrated_bond_index_yield_bamlh0a3hycey',
    usCorporateYield: 'qundal_us_corporate_bond_index_yield_bamlc0a0cmey',
    usHighYield: 'qundal_us_high_yield_corporate_bond_index_yield_bamlh0a0hym2ey',
    usEmergingMarket: 'qundal_euro_emerging_markets_corporate_bond_index_yield_bamlemebcrpieey',
  },
  treasury: {
    us1Month: 'qundal_treasury_yield_curve_rates_1_mo',
    us2Month: 'qundal_treasury_yield_curve_rates_2_mo',
    us3Month: 'qundal_treasury_yield_curve_rates_3_mo',
    us6Month: 'qundal_treasury_yield_curve_rates_6_mo',
    us1Year: 'qundal_treasury_yield_curve_rates_1_yr',
    us2Year: 'qundal_treasury_yield_curve_rates_2_yr',
    us3Year: 'qundal_treasury_yield_curve_rates_3_yr',
    us5Year: 'qundal_treasury_yield_curve_rates_5_yr',
    us7Year: 'qundal_treasury_yield_curve_rates_7_yr',
    us10Year: 'qundal_treasury_yield_curve_rates_10_yr',
    us20Year: 'qundal_treasury_yield_curve_rates_20_yr',
    us30Year: 'qundal_treasury_yield_curve_rates_30_yr',
  },
  consumerPriceIndex: {
    usCpi: 'qundal_consumer_price_index__usa_value',
    euCpi: 'qundal_consumer_price_index__euro_area_value',
    ukCpi: 'qundal_consumer_price_index__uk_value',
    jpCpi: 'qundal_consumer_price_index__japan_value',
    caCpi: 'qundal_consumer_price_index__canada_value',
    cheCpi: 'qundal_consumer_price_index__switzerland_value',
    rusCpi: 'qundal_consumer_price_index__russia_value',
    ausCpi: 'qundal_consumer_price_index__australia_value',
    gerCpi: 'qundal_consumer_price_index__germany_value',
    fraCpi: 'qundal_consumer_price_index__france_value',
    itaCpi: 'qundal_consumer_price_index__italy_value',
    nzlCpi: 'qundal_consumer_price_index__new_zealand_value',
  },
  inflationRate: {
    usInflationRate: 'qundal_inflation_rate__usa_value',
    euInflationRate: 'qundal_inflation_rate__euro_area_value',
    ukInflationRate: 'qundal_inflation_rate__uk_value',
    jpInflationRate: 'qundal_inflation_rate__japan_value',
    caInflationRate: 'qundal_inflation_rate__canada_value',
    cheInflationRate: 'qundal_inflation_rate__switzerland_value',
    rusInflationRate: 'qundal_inflation_rate__russia_value',
    ausInflationRate: 'qundal_inflation_rate__australia_value',
    gerInflationRate: 'qundal_inflation_rate__germany_value',
    fraInflationRate: 'qundal_inflation_rate__france_value',
    itaInflationRate: 'qundal_inflation_rate__italy_value',
    nzlInflationRate: 'qundal_inflation_rate__new_zealand_value',
  },
  bitcoin: {
    marketCap: 'qundal_bitcoin_market_cap_value',
    tradingVolume: 'qundal_bitcoin_trading_volume_value',
    transactionFees: 'qundal_bitcoin_transaction_fees_value',
    transactionTime: 'qundal_bitcoin_transaction_time_value',
    transactionCost: 'qundal_bitcoin_transaction_cost_value',
    dailyTransactions: 'qundal_bitcoin_daily_transactions_value',
  },
};

export const MARKET_OVERVIEW_DATA = [
  {
    name: 'S&P 500',
    key: 'sp500',
    data: [
      {
        name: 'S&P 500 - PE ratio',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.peRatio,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Shiller PE',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.shillerPeRatio,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Book value',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.bookValue,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Price to book',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToBook,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Sales',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.sales,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Sales growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.salesGrowth,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Price to sale',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToSales,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Earnings',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earnings,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Earnings growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsGrowth,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Earnings yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsYield,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Dividend yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendYield,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Dividend',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividend,
        provider: 'quandl',
      },
      {
        name: 'S&P 500 - Dividend growth',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendGrowth,
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
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAAYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - US AA yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - US A yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - US BB yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBBYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - US B yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - US CCC yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCCCYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - US Corporate yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCorporateYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - US high yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usHighYield,
        provider: 'quandl',
      },
      {
        name: 'Bond - Emerging markets high yield',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usEmergingMarket,
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
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Month,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 2 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Month,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 3 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Month,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 6 MO',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us6Month,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 1 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Year,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 2 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Year,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 3 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Year,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 5 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us5Year,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 7 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us7Year,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 10 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us10Year,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 20 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us20Year,
        provider: 'quandl',
      },
      {
        name: 'Treasury yield 30 YR',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us30Year,
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
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.usCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Europe',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.euCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - UK',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.ukCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Japan',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.jpCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Canada',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.caCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Switzerland',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.cheCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Russia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.rusCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Australia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.ausCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Germany',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.gerCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - France',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.fraCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - Italy',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.itaCpi,
        provider: 'quandl',
      },
      {
        name: 'Consumer price index - New Zealand',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.nzlCpi,
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
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.usInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Europe',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.euInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - UK',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ukInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Canada',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.caInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Japan',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.jpInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Switzerland',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.cheInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Russia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.rusInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Australia',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ausInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Germany',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.gerInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - France',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.fraInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - Italy',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.itaInflationRate,
        provider: 'quandl',
      },
      {
        name: 'Inflation YOY - New Zealand',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.nzlInflationRate,
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
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.marketCap,
        provider: 'quandl',
      },
      {
        name: 'Traiding volume',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.tradingVolume,
        provider: 'quandl',
      },
      {
        name: 'Transaction fees',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionFees,
        provider: 'quandl',
      },
      {
        name: 'Transaction time',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionTime,
        provider: 'quandl',
      },
      {
        name: 'Transaction cost',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionCost,
        provider: 'quandl',
      },
      {
        name: 'Daily transactions',
        databaseKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.dailyTransactions,
        provider: 'quandl',
      },
    ],
  },
] as const;
