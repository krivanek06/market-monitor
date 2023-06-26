export enum FirebaseMarketDataFields {
  // collections
  market_data = 'market_data',

  // documents
  market_top_performance = 'market_top_performance',
  market_news_general = 'market_news_general',
  market_news_crypto = 'market_news_crypto',
  market_news_forex = 'market_news_forex',
  market_news_stocks = 'market_news_stocks',
}

export const MARKET_OVERVIEW_DATABASE_KEYS = {
  sp500: {
    peRatio: {
      document: 'qundal_sp_500_pe_ratio_by_month_value',
      url: 'MULTPL/SP500_PE_RATIO_MONTH',
    },
    shillerPeRatio: {
      document: 'qundal_shiller_pe_ratio_by_month_value',
      url: 'MULTPL/SHILLER_PE_RATIO_MONTH',
    },
    bookValue: {
      document: 'qundal_sp_500_book_value_per_share_by_quarter_value',
      url: 'MULTPL/SP500_BVPS_QUARTER',
    },
    priceToBook: {
      document: 'qundal_sp_500_price_to_book_value_by_quarter_value',
      url: 'MULTPL/SP500_PBV_RATIO_QUARTER',
    },
    sales: {
      document: 'qundal_sp_500_real_sales_by_quarter_value',
      url: 'MULTPL/SP500_SALES_QUARTER',
    },
    salesGrowth: {
      document: 'qundal_sp_500_real_sales_growth_by_quarter_value',
      url: 'MULTPL/SP500_SALES_GROWTH_QUARTER',
    },
    priceToSales: {
      document: 'qundal_sp_500_price_to_sales_ratio_by_quarter_value',
      url: 'MULTPL/SP500_PSR_QUARTER',
    },
    earnings: {
      document: 'qundal_sp_500_earnings_by_month_value',
      url: 'MULTPL/SP500_EARNINGS_MONTH',
    },
    earningsGrowth: {
      document: 'qundal_sp_500_earnings_growth_rate_by_quarter_value',
      url: 'MULTPL/SP500_EARNINGS_GROWTH_QUARTER',
    },
    earningsYield: {
      document: 'qundal_sp_500_earnings_yield_by_month_value',
      url: 'MULTPL/SP500_EARNINGS_YIELD_MONTH',
    },
    dividendYield: {
      document: 'qundal_sp_500_dividend_yield_by_month_value',
      url: 'MULTPL/SP500_DIV_YIELD_MONTH',
    },
    dividend: {
      document: 'qundal_sp_500_dividend_by_month_value',
      url: 'MULTPL/SP500_DIV_MONTH',
    },
    dividendGrowth: {
      document: 'qundal_sp_500_dividend_growth_by_quarter_value',
      url: 'MULTPL/SP500_DIV_GROWTH_QUARTER',
    },
  },
  bonds: {
    usAAAYield: {
      document: 'qundal_us_aaa_rated_bond_index_yield_bamlc0a1caaaey',
      url: 'ML/AAAEY',
    },
    usAAYield: {
      document: 'qundal_us_aa_bond_index_yield_bamlc0a2caaey',
      url: 'ML/AAY',
    },
    usAYield: {
      document: 'qundal_us_corporate_bond_a_rated_index_yield_bamlc0a3caey',
      url: 'ML/AEY',
    },
    usBBYield: {
      document: 'qundal_us_high_yield_bb_corporate_bond_index_yield_bamlh0a1hybbey',
      url: 'ML/BBY',
    },
    usBYield: {
      document: 'qundal_us_b_rated_corporate_bond_index_yield_bamlh0a2hybey',
      url: 'ML/BEY',
    },
    usCCCYield: {
      document: 'qundal_us_cccrated_bond_index_yield_bamlh0a3hycey',
      url: 'ML/CCCY',
    },
    usCorporateYield: {
      document: 'qundal_us_corporate_bond_index_yield_bamlc0a0cmey',
      url: 'ML/USEY',
    },
    usHighYield: {
      document: 'qundal_us_high_yield_corporate_bond_index_yield_bamlh0a0hym2ey',
      url: 'ML/USTRI',
    },
    usEmergingMarket: {
      document: 'qundal_euro_emerging_markets_corporate_bond_index_yield_bamlemebcrpieey',
      url: 'ML/EMHYY',
    },
  },
  treasury: {
    us1Month: {
      document: 'qundal_treasury_yield_curve_rates_1_mo',
      url: 'USTREASURY/YIELD',
    },
    us2Month: {
      document: 'qundal_treasury_yield_curve_rates_2_mo',
      url: 'USTREASURY/YIELD',
    },
    us3Month: {
      document: 'qundal_treasury_yield_curve_rates_3_mo',
      url: 'USTREASURY/YIELD',
    },
    us6Month: {
      document: 'qundal_treasury_yield_curve_rates_6_mo',
      url: 'USTREASURY/YIELD',
    },
    us1Year: {
      document: 'qundal_treasury_yield_curve_rates_1_yr',
      url: 'USTREASURY/YIELD',
    },
    us2Year: {
      document: 'qundal_treasury_yield_curve_rates_2_yr',
      url: 'USTREASURY/YIELD',
    },
    us3Year: {
      document: 'qundal_treasury_yield_curve_rates_3_yr',
      url: 'USTREASURY/YIELD',
    },
    us5Year: {
      document: 'qundal_treasury_yield_curve_rates_5_yr',
      url: 'USTREASURY/YIELD',
    },
    us7Year: {
      document: 'qundal_treasury_yield_curve_rates_7_yr',
      url: 'USTREASURY/YIELD',
    },
    us10Year: {
      document: 'qundal_treasury_yield_curve_rates_10_yr',
      url: 'USTREASURY/YIELD',
    },
    us20Year: {
      document: 'qundal_treasury_yield_curve_rates_20_yr',
      url: 'USTREASURY/YIELD',
    },
    us30Year: {
      document: 'qundal_treasury_yield_curve_rates_30_yr',
      url: 'USTREASURY/YIELD',
    },
  },
  consumerPriceIndex: {
    usCpi: {
      document: 'qundal_consumer_price_index__usa_value',
      url: 'RATEINF/CPI_USA',
    },
    euCpi: {
      document: 'qundal_consumer_price_index__euro_area_value',
      url: 'RATEINF/CPI_EU',
    },
    ukCpi: {
      document: 'qundal_consumer_price_index__uk_value',
      url: 'RATEINF/CPI_UK',
    },
    jpCpi: {
      document: 'qundal_consumer_price_index__japan_value',
      url: 'RATEINF/CPI_JPN',
    },
    caCpi: {
      document: 'qundal_consumer_price_index__canada_value',
      url: 'RATEINF/CPI_CAN',
    },
    cheCpi: {
      document: 'qundal_consumer_price_index__switzerland_value',
      url: 'RATEINF/CPI_CHE',
    },
    rusCpi: {
      document: 'qundal_consumer_price_index__russia_value',
      url: 'RATEINF/CPI_RUS',
    },
    ausCpi: {
      document: 'qundal_consumer_price_index__australia_value',
      url: 'RATEINF/CPI_AUS',
    },
    gerCpi: {
      document: 'qundal_consumer_price_index__germany_value',
      url: 'RATEINF/CPI_DEU',
    },
    fraCpi: {
      document: 'qundal_consumer_price_index__france_value',
      url: 'RATEINF/CPI_FRA',
    },
    itaCpi: {
      document: 'qundal_consumer_price_index__italy_value',
      url: 'RATEINF/CPI_ITA',
    },
    nzlCpi: {
      document: 'qundal_consumer_price_index__new_zealand_value',
      url: 'RATEINF/CPI_NZL',
    },
  },
  inflationRate: {
    usInflationRate: {
      document: 'qundal_inflation_rate__usa_value',
      url: 'RATEINF/INFLATION_USA',
    },
    euInflationRate: {
      document: 'qundal_inflation_rate__euro_area_value',
      url: 'RATEINF/INFLATION_EUR',
    },
    ukInflationRate: {
      document: 'qundal_inflation_rate__uk_value',
      url: 'RATEINF/INFLATION_GBR',
    },
    jpInflationRate: {
      document: 'qundal_inflation_rate__japan_value',
      url: 'RATEINF/INFLATION_CAN',
    },
    caInflationRate: {
      document: 'qundal_inflation_rate__canada_value',
      url: 'RATEINF/INFLATION_JPN',
    },
    cheInflationRate: {
      document: 'qundal_inflation_rate__switzerland_value',
      url: 'RATEINF/INFLATION_CHE',
    },
    rusInflationRate: {
      document: 'qundal_inflation_rate__russia_value',
      url: 'RATEINF/INFLATION_RUS',
    },
    ausInflationRate: {
      document: 'qundal_inflation_rate__australia_value',
      url: 'RATEINF/INFLATION_AUS',
    },
    gerInflationRate: {
      document: 'qundal_inflation_rate__germany_value',
      url: 'RATEINF/INFLATION_DEU',
    },
    fraInflationRate: {
      document: 'qundal_inflation_rate__france_value',
      url: 'RATEINF/INFLATION_FRA',
    },
    itaInflationRate: {
      document: 'qundal_inflation_rate__italy_value',
      url: 'RATEINF/INFLATION_ITA',
    },
    nzlInflationRate: {
      document: 'qundal_inflation_rate__new_zealand_value',
      url: 'RATEINF/INFLATION_NZL',
    },
  },
  bitcoin: {
    marketCap: {
      document: 'qundal_bitcoin_market_cap_value',
      url: 'BCHAIN/MKTCP',
    },
    tradingVolume: {
      document: 'qundal_bitcoin_trading_volume_value',
      url: 'BCHAIN/TRVOU',
    },
    transactionFees: {
      document: 'qundal_bitcoin_transaction_fees_value',
      url: 'BCHAIN/TRFUS',
    },
    transactionTime: {
      document: 'qundal_bitcoin_transaction_time_value',
      url: 'BCHAIN/ATRCT',
    },
    transactionCost: {
      document: 'qundal_bitcoin_transaction_cost_value',
      url: 'BCHAIN/CPTRA',
    },
    dailyTransactions: {
      document: 'qundal_bitcoin_daily_transactions_value',
      url: 'BCHAIN/NTRAN',
    },
  },
} as const;
