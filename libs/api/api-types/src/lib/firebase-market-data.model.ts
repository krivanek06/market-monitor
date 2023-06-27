import { MostPerformingStocks, PriceChange } from './external-api/financial-modeling-starter.model';
import { StockSummary } from './firebase-stock-data.model';

export type MarketTopPerformance<T> = {
  stockTopGainers: T[];
  stockTopLosers: T[];
  stockTopActive: T[];
  sp500Change: PriceChange;
  lastUpdate: string;
};

export type MarketTopPerformanceOverview = MarketTopPerformance<MostPerformingStocks> & {};

export type MarketTopPerformanceOverviewResponse = MarketTopPerformance<StockSummary> & {};

// ------------------ News ------------------

export const firebaseNewsAcceptableTypes = ['general', 'stocks', 'forex', 'crypto'] as const;
export type FirebaseNewsTypes = (typeof firebaseNewsAcceptableTypes)[number];

// ------------------ Market Overview ------------------

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

export const MARKET_OVERVIEW_DATABASE_ENDPOINTS = {
  sp500: {
    peRatio: {
      document: 'qundal_sp_500_pe_ratio_by_month_value',
      url: 'MULTPL/SP500_PE_RATIO_MONTH',
      provider: 'quandl',
    },
    shillerPeRatio: {
      document: 'qundal_shiller_pe_ratio_by_month_value',
      url: 'MULTPL/SHILLER_PE_RATIO_MONTH',
      provider: 'quandl',
    },
    bookValue: {
      document: 'qundal_sp_500_book_value_per_share_by_quarter_value',
      url: 'MULTPL/SP500_BVPS_QUARTER',
      provider: 'quandl',
    },
    priceToBook: {
      document: 'qundal_sp_500_price_to_book_value_by_quarter_value',
      url: 'MULTPL/SP500_PBV_RATIO_QUARTER',
      provider: 'quandl',
    },
    sales: {
      document: 'qundal_sp_500_real_sales_by_quarter_value',
      url: 'MULTPL/SP500_SALES_QUARTER',
      provider: 'quandl',
    },
    salesGrowth: {
      document: 'qundal_sp_500_real_sales_growth_by_quarter_value',
      url: 'MULTPL/SP500_SALES_GROWTH_QUARTER',
      provider: 'quandl',
    },
    priceToSales: {
      document: 'qundal_sp_500_price_to_sales_ratio_by_quarter_value',
      url: 'MULTPL/SP500_PSR_QUARTER',
      provider: 'quandl',
    },
    earnings: {
      document: 'qundal_sp_500_earnings_by_month_value',
      url: 'MULTPL/SP500_EARNINGS_MONTH',
      provider: 'quandl',
    },
    earningsGrowth: {
      document: 'qundal_sp_500_earnings_growth_rate_by_quarter_value',
      url: 'MULTPL/SP500_EARNINGS_GROWTH_QUARTER',
      provider: 'quandl',
    },
    earningsYield: {
      document: 'qundal_sp_500_earnings_yield_by_month_value',
      url: 'MULTPL/SP500_EARNINGS_YIELD_MONTH',
      provider: 'quandl',
    },
    dividendYield: {
      document: 'qundal_sp_500_dividend_yield_by_month_value',
      url: 'MULTPL/SP500_DIV_YIELD_MONTH',
      provider: 'quandl',
    },
    dividend: {
      document: 'qundal_sp_500_dividend_by_month_value',
      url: 'MULTPL/SP500_DIV_MONTH',
      provider: 'quandl',
    },
    dividendGrowth: {
      document: 'qundal_sp_500_dividend_growth_by_quarter_value',
      url: 'MULTPL/SP500_DIV_GROWTH_QUARTER',
      provider: 'quandl',
    },
  },
  bonds: {
    usAAAYield: {
      document: 'qundal_us_aaa_rated_bond_index_yield_bamlc0a1caaaey',
      url: 'ML/AAAEY',
      provider: 'quandl',
    },
    usAAYield: {
      document: 'qundal_us_aa_bond_index_yield_bamlc0a2caaey',
      url: 'ML/AAY',
      provider: 'quandl',
    },
    usAYield: {
      document: 'qundal_us_corporate_bond_a_rated_index_yield_bamlc0a3caey',
      url: 'ML/AEY',
      provider: 'quandl',
    },
    usBBYield: {
      document: 'qundal_us_high_yield_bb_corporate_bond_index_yield_bamlh0a1hybbey',
      url: 'ML/BBY',
      provider: 'quandl',
    },
    usBYield: {
      document: 'qundal_us_b_rated_corporate_bond_index_yield_bamlh0a2hybey',
      url: 'ML/BEY',
      provider: 'quandl',
    },
    usCCCYield: {
      document: 'qundal_us_cccrated_bond_index_yield_bamlh0a3hycey',
      url: 'ML/CCCY',
      provider: 'quandl',
    },
    usCorporateYield: {
      document: 'qundal_us_corporate_bond_index_yield_bamlc0a0cmey',
      url: 'ML/USEY',
      provider: 'quandl',
    },
    usHighYield: {
      document: 'qundal_us_high_yield_corporate_bond_index_yield_bamlh0a0hym2ey',
      url: 'ML/USTRI',
      provider: 'quandl',
    },
    usEmergingMarket: {
      document: 'qundal_euro_emerging_markets_corporate_bond_index_yield_bamlemebcrpieey',
      url: 'ML/EMHYY',
      provider: 'quandl',
    },
  },
  treasury: {
    us1Month: {
      document: 'qundal_treasury_yield_curve_rates_1_mo',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us2Month: {
      document: 'qundal_treasury_yield_curve_rates_2_mo',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us3Month: {
      document: 'qundal_treasury_yield_curve_rates_3_mo',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us6Month: {
      document: 'qundal_treasury_yield_curve_rates_6_mo',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us1Year: {
      document: 'qundal_treasury_yield_curve_rates_1_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us2Year: {
      document: 'qundal_treasury_yield_curve_rates_2_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us3Year: {
      document: 'qundal_treasury_yield_curve_rates_3_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us5Year: {
      document: 'qundal_treasury_yield_curve_rates_5_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us7Year: {
      document: 'qundal_treasury_yield_curve_rates_7_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us10Year: {
      document: 'qundal_treasury_yield_curve_rates_10_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us20Year: {
      document: 'qundal_treasury_yield_curve_rates_20_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
    us30Year: {
      document: 'qundal_treasury_yield_curve_rates_30_yr',
      url: 'USTREASURY/YIELD',
      provider: 'quandl',
    },
  },
  consumerIndex: {
    usCpi: {
      document: 'qundal_consumer_price_index__usa_value',
      url: 'RATEINF/CPI_USA',
      provider: 'quandl',
    },
    euCpi: {
      document: 'qundal_consumer_price_index__euro_area_value',
      url: 'RATEINF/CPI_EUR',
      provider: 'quandl',
    },
    ukCpi: {
      document: 'qundal_consumer_price_index__uk_value',
      url: 'RATEINF/CPI_GBR',
      provider: 'quandl',
    },
    jpCpi: {
      document: 'qundal_consumer_price_index__japan_value',
      url: 'RATEINF/CPI_JPN',
      provider: 'quandl',
    },
    caCpi: {
      document: 'qundal_consumer_price_index__canada_value',
      url: 'RATEINF/CPI_CAN',
      provider: 'quandl',
    },
    cheCpi: {
      document: 'qundal_consumer_price_index__switzerland_value',
      url: 'RATEINF/CPI_CHE',
      provider: 'quandl',
    },
    rusCpi: {
      document: 'qundal_consumer_price_index__russia_value',
      url: 'RATEINF/CPI_RUS',
      provider: 'quandl',
    },
    ausCpi: {
      document: 'qundal_consumer_price_index__australia_value',
      url: 'RATEINF/CPI_AUS',
      provider: 'quandl',
    },
    gerCpi: {
      document: 'qundal_consumer_price_index__germany_value',
      url: 'RATEINF/CPI_DEU',
      provider: 'quandl',
    },
    fraCpi: {
      document: 'qundal_consumer_price_index__france_value',
      url: 'RATEINF/CPI_FRA',
      provider: 'quandl',
    },
    itaCpi: {
      document: 'qundal_consumer_price_index__italy_value',
      url: 'RATEINF/CPI_ITA',
      provider: 'quandl',
    },
    nzlCpi: {
      document: 'qundal_consumer_price_index__new_zealand_value',
      url: 'RATEINF/CPI_NZL',
      provider: 'quandl',
    },
  },
  inflationRate: {
    usInflationRate: {
      document: 'qundal_inflation_rate__usa_value',
      url: 'RATEINF/INFLATION_USA',
      provider: 'quandl',
    },
    euInflationRate: {
      document: 'qundal_inflation_rate__euro_area_value',
      url: 'RATEINF/INFLATION_EUR',
      provider: 'quandl',
    },
    ukInflationRate: {
      document: 'qundal_inflation_rate__uk_value',
      url: 'RATEINF/INFLATION_GBR',
      provider: 'quandl',
    },
    jpInflationRate: {
      document: 'qundal_inflation_rate__japan_value',
      url: 'RATEINF/INFLATION_CAN',
      provider: 'quandl',
    },
    caInflationRate: {
      document: 'qundal_inflation_rate__canada_value',
      url: 'RATEINF/INFLATION_JPN',
      provider: 'quandl',
    },
    cheInflationRate: {
      document: 'qundal_inflation_rate__switzerland_value',
      url: 'RATEINF/INFLATION_CHE',
      provider: 'quandl',
    },
    rusInflationRate: {
      document: 'qundal_inflation_rate__russia_value',
      url: 'RATEINF/INFLATION_RUS',
      provider: 'quandl',
    },
    ausInflationRate: {
      document: 'qundal_inflation_rate__australia_value',
      url: 'RATEINF/INFLATION_AUS',
      provider: 'quandl',
    },
    gerInflationRate: {
      document: 'qundal_inflation_rate__germany_value',
      url: 'RATEINF/INFLATION_DEU',
      provider: 'quandl',
    },
    fraInflationRate: {
      document: 'qundal_inflation_rate__france_value',
      url: 'RATEINF/INFLATION_FRA',
      provider: 'quandl',
    },
    itaInflationRate: {
      document: 'qundal_inflation_rate__italy_value',
      url: 'RATEINF/INFLATION_ITA',
      provider: 'quandl',
    },
    nzlInflationRate: {
      document: 'qundal_inflation_rate__new_zealand_value',
      url: 'RATEINF/INFLATION_NZL',
      provider: 'quandl',
    },
  },
  bitcoin: {
    marketCap: {
      document: 'qundal_bitcoin_market_cap_value',
      url: 'BCHAIN/MKTCP',
      provider: 'quandl',
    },
    tradingVolume: {
      document: 'qundal_bitcoin_trading_volume_value',
      url: 'BCHAIN/TRVOU',
      provider: 'quandl',
    },
    transactionFees: {
      document: 'qundal_bitcoin_transaction_fees_value',
      url: 'BCHAIN/TRFUS',
      provider: 'quandl',
    },
    transactionTime: {
      document: 'qundal_bitcoin_transaction_time_value',
      url: 'BCHAIN/ATRCT',
      provider: 'quandl',
    },
    transactionCost: {
      document: 'qundal_bitcoin_transaction_cost_value',
      url: 'BCHAIN/CPTRA',
      provider: 'quandl',
    },
    dailyTransactions: {
      document: 'qundal_bitcoin_daily_transactions_value',
      url: 'BCHAIN/NTRAN',
      provider: 'quandl',
    },
  },
} as const;

export type MarketOverviewDatabaseKeys = keyof typeof MARKET_OVERVIEW_DATABASE_ENDPOINTS;
export type MarketOverviewDatabaseKeySubKeys<T extends MarketOverviewDatabaseKeys> =
  keyof (typeof MARKET_OVERVIEW_DATABASE_ENDPOINTS)[T];

export const MARKET_OVERVIEW_DATABASE_KEYS = Object.entries(MARKET_OVERVIEW_DATABASE_ENDPOINTS)
  .map(([key, value]) => {
    const subkeys = Object.keys(value)
      .map((d) => ({ [d]: d }))
      .reduce((acc2, cur2) => ({ ...acc2, ...cur2 }), {});
    const result = {
      [key]: {
        ...subkeys,
      },
    } as {
      [K in MarketOverviewDatabaseKeys]: {
        [S in MarketOverviewDatabaseKeySubKeys<K>]: S;
      };
    };
    return result;
  })
  .reduce((acc, curr) => ({ ...acc, ...curr }));

export type MarketOverviewData = {
  data: number[];
  dates: string[];
  frequency: string;
  start_date: string;
  end_date: string;
  lastUpdate: string;
  name: string;
};

export type MarketOverview = {
  sp500: {
    peRatio: MarketOverviewData;
    shillerPeRatio: MarketOverviewData;
    priceToBook: MarketOverviewData;
    priceToSales: MarketOverviewData;
    earningsYield: MarketOverviewData;
    dividendYield: MarketOverviewData;
  };
  treasury: {
    us1Month: MarketOverviewData;
    us3Month: MarketOverviewData;
    us1Year: MarketOverviewData;
    us5Year: MarketOverviewData;
    us10Year: MarketOverviewData;
    us30Year: MarketOverviewData;
  };
  bonds: {
    usAAAYield: MarketOverviewData;
    usAAYield: MarketOverviewData;
    usBBYield: MarketOverviewData;
    usCCCYield: MarketOverviewData;
    usCorporateYield: MarketOverviewData;
    usHighYield: MarketOverviewData;
    usEmergingMarket: MarketOverviewData;
  };
  consumerIndex: {
    usCpi: MarketOverviewData;
    euCpi: MarketOverviewData;
    ukCpi: MarketOverviewData;
    gerCpi: MarketOverviewData;
  };
  inflationRate: {
    usInflationRate: MarketOverviewData;
    euInflationRate: MarketOverviewData;
    ukInflationRate: MarketOverviewData;
    gerInflationRate: MarketOverviewData;
  };
};

export const marketOverviewToLoad: { [K in keyof MarketOverview]: Array<keyof MarketOverview[K]> } = {
  sp500: ['peRatio', 'shillerPeRatio', 'priceToSales', 'priceToBook', 'earningsYield', 'dividendYield'],
  bonds: ['usAAAYield', 'usAAYield', 'usBBYield', 'usCCCYield', 'usCorporateYield', 'usEmergingMarket', 'usHighYield'],
  consumerIndex: ['euCpi', 'gerCpi', 'ukCpi', 'usCpi'],
  inflationRate: ['euInflationRate', 'gerInflationRate', 'ukInflationRate', 'usInflationRate'],
  treasury: ['us10Year', 'us1Month', 'us1Year', 'us30Year', 'us3Month', 'us5Year'],
};
