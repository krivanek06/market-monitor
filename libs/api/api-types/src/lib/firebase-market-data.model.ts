import { MostPerformingStocks, PriceChange } from './external-api/financial-modeling.model';
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

export const NewsAcceptableTypes = ['general', 'stocks', 'forex', 'crypto'] as const;
export type NewsTypes = (typeof NewsAcceptableTypes)[number];

// ------------------ Market Overview ------------------

export type MarketOverviewDatabaseEndpointBody = {
  document: string;
  url: string;
  provider: string;
  name: string;
};

export const MARKET_OVERVIEW_DATABASE_ENDPOINTS = {
  sp500: {
    name: 'S&P 500',
    data: {
      peRatio: {
        document: 'qundal_sp_500_pe_ratio_by_month_value',
        url: 'MULTPL/SP500_PE_RATIO_MONTH',
        provider: 'quandl',
        name: 'PE ratio',
      },
      shillerPeRatio: {
        document: 'qundal_shiller_pe_ratio_by_month_value',
        url: 'MULTPL/SHILLER_PE_RATIO_MONTH',
        provider: 'quandl',
        name: 'Shiller PE',
      },
      bookValue: {
        document: 'qundal_sp_500_book_value_per_share_by_quarter_value',
        url: 'MULTPL/SP500_BVPS_QUARTER',
        provider: 'quandl',
        name: 'Book value',
      },
      priceToBook: {
        document: 'qundal_sp_500_price_to_book_value_by_quarter_value',
        url: 'MULTPL/SP500_PBV_RATIO_QUARTER',
        provider: 'quandl',
        name: 'Price to book',
      },
      sales: {
        document: 'qundal_sp_500_real_sales_by_quarter_value',
        url: 'MULTPL/SP500_SALES_QUARTER',
        provider: 'quandl',
        name: 'Sales',
      },
      salesGrowth: {
        document: 'qundal_sp_500_real_sales_growth_by_quarter_value',
        url: 'MULTPL/SP500_SALES_GROWTH_QUARTER',
        provider: 'quandl',
        name: 'Sales growth',
      },
      priceToSales: {
        document: 'qundal_sp_500_price_to_sales_ratio_by_quarter_value',
        url: 'MULTPL/SP500_PSR_QUARTER',
        provider: 'quandl',
        name: 'Price to sale',
      },
      earnings: {
        document: 'qundal_sp_500_earnings_by_month_value',
        url: 'MULTPL/SP500_EARNINGS_MONTH',
        provider: 'quandl',
        name: 'Earnings',
      },
      earningsGrowth: {
        document: 'qundal_sp_500_earnings_growth_rate_by_quarter_value',
        url: 'MULTPL/SP500_EARNINGS_GROWTH_QUARTER',
        provider: 'quandl',
        name: 'Earnings growth',
      },
      earningsYield: {
        document: 'qundal_sp_500_earnings_yield_by_month_value',
        url: 'MULTPL/SP500_EARNINGS_YIELD_MONTH',
        provider: 'quandl',
        name: 'Earnings yield',
      },
      dividendYield: {
        document: 'qundal_sp_500_dividend_yield_by_month_value',
        url: 'MULTPL/SP500_DIV_YIELD_MONTH',
        provider: 'quandl',
        name: 'Dividend yield',
      },
      dividend: {
        document: 'qundal_sp_500_dividend_by_month_value',
        url: 'MULTPL/SP500_DIV_MONTH',
        provider: 'quandl',
        name: 'Dividend',
      },
      dividendGrowth: {
        document: 'qundal_sp_500_dividend_growth_by_quarter_value',
        url: 'MULTPL/SP500_DIV_GROWTH_QUARTER',
        provider: 'quandl',
        name: 'Dividend growth',
      },
    },
  },
  bonds: {
    name: 'Bonds',
    data: {
      usAAAYield: {
        document: 'qundal_us_aaa_rated_bond_index_yield_bamlc0a1caaaey',
        url: 'ML/AAAEY',
        provider: 'quandl',
        name: 'US AAA yield',
      },
      usAAYield: {
        document: 'qundal_us_aa_bond_index_yield_bamlc0a2caaey',
        url: 'ML/AAY',
        provider: 'quandl',
        name: 'US AA yield',
      },
      usAYield: {
        document: 'qundal_us_corporate_bond_a_rated_index_yield_bamlc0a3caey',
        url: 'ML/AEY',
        provider: 'quandl',
        name: 'US A yield',
      },
      usBBYield: {
        document: 'qundal_us_high_yield_bb_corporate_bond_index_yield_bamlh0a1hybbey',
        url: 'ML/BBY',
        provider: 'quandl',
        name: 'US BB yield',
      },
      usBYield: {
        document: 'qundal_us_b_rated_corporate_bond_index_yield_bamlh0a2hybey',
        url: 'ML/BEY',
        provider: 'quandl',
        name: 'US B yield',
      },
      usCCCYield: {
        document: 'qundal_us_cccrated_bond_index_yield_bamlh0a3hycey',
        url: 'ML/CCCY',
        provider: 'quandl',
        name: 'US CCC yield',
      },
      usCorporateYield: {
        document: 'qundal_us_corporate_bond_index_yield_bamlc0a0cmey',
        url: 'ML/USEY',
        provider: 'quandl',
        name: 'US Corporate yield',
      },
      usHighYield: {
        document: 'qundal_us_high_yield_corporate_bond_index_yield_bamlh0a0hym2ey',
        url: 'ML/USTRI',
        provider: 'quandl',
        name: 'US high yield',
      },
      usEmergingMarket: {
        document: 'qundal_euro_emerging_markets_corporate_bond_index_yield_bamlemebcrpieey',
        url: 'ML/EMHYY',
        provider: 'quandl',
        name: 'Emerging markets high yield',
      },
    },
  },
  treasury: {
    name: 'Treasury',
    data: {
      us1Month: {
        document: 'qundal_treasury_yield_curve_rates_1_mo',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 1 MO',
      },
      us2Month: {
        document: 'qundal_treasury_yield_curve_rates_2_mo',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 2 MO',
      },
      us3Month: {
        document: 'qundal_treasury_yield_curve_rates_3_mo',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 3 MO',
      },
      us6Month: {
        document: 'qundal_treasury_yield_curve_rates_6_mo',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 6 MO',
      },
      us1Year: {
        document: 'qundal_treasury_yield_curve_rates_1_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 1 YR',
      },
      us2Year: {
        document: 'qundal_treasury_yield_curve_rates_2_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 2 YR',
      },
      us3Year: {
        document: 'qundal_treasury_yield_curve_rates_3_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 3 YR',
      },
      us5Year: {
        document: 'qundal_treasury_yield_curve_rates_5_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 5 YR',
      },
      us7Year: {
        document: 'qundal_treasury_yield_curve_rates_7_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 7 YR',
      },
      us10Year: {
        document: 'qundal_treasury_yield_curve_rates_10_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 10 YR',
      },
      us20Year: {
        document: 'qundal_treasury_yield_curve_rates_20_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 20 YR',
      },
      us30Year: {
        document: 'qundal_treasury_yield_curve_rates_30_yr',
        url: 'USTREASURY/YIELD',
        provider: 'quandl',
        name: 'yield 30 YR',
      },
    },
  },
  consumerIndex: {
    name: 'Consumer price index',
    data: {
      usCpi: {
        document: 'qundal_consumer_price_index__usa_value',
        url: 'RATEINF/CPI_USA',
        provider: 'quandl',
        name: 'USA',
      },
      euCpi: {
        document: 'qundal_consumer_price_index__euro_area_value',
        url: 'RATEINF/CPI_EUR',
        provider: 'quandl',
        name: 'Europe',
      },
      ukCpi: {
        document: 'qundal_consumer_price_index__uk_value',
        url: 'RATEINF/CPI_GBR',
        provider: 'quandl',
        name: 'UK',
      },
      jpCpi: {
        document: 'qundal_consumer_price_index__japan_value',
        url: 'RATEINF/CPI_JPN',
        provider: 'quandl',
        name: 'Japan',
      },
      caCpi: {
        document: 'qundal_consumer_price_index__canada_value',
        url: 'RATEINF/CPI_CAN',
        provider: 'quandl',
        name: 'Canada',
      },
      cheCpi: {
        document: 'qundal_consumer_price_index__switzerland_value',
        url: 'RATEINF/CPI_CHE',
        provider: 'quandl',
        name: 'Switzerland',
      },
      rusCpi: {
        document: 'qundal_consumer_price_index__russia_value',
        url: 'RATEINF/CPI_RUS',
        provider: 'quandl',
        name: 'Russia',
      },
      ausCpi: {
        document: 'qundal_consumer_price_index__australia_value',
        url: 'RATEINF/CPI_AUS',
        provider: 'quandl',
        name: 'Australia',
      },
      gerCpi: {
        document: 'qundal_consumer_price_index__germany_value',
        url: 'RATEINF/CPI_DEU',
        provider: 'quandl',
        name: 'Germany',
      },
      fraCpi: {
        document: 'qundal_consumer_price_index__france_value',
        url: 'RATEINF/CPI_FRA',
        provider: 'quandl',
        name: 'France',
      },
      itaCpi: {
        document: 'qundal_consumer_price_index__italy_value',
        url: 'RATEINF/CPI_ITA',
        provider: 'quandl',
        name: 'Italy',
      },
      nzlCpi: {
        document: 'qundal_consumer_price_index__new_zealand_value',
        url: 'RATEINF/CPI_NZL',
        provider: 'quandl',
        name: 'New Zealand',
      },
    },
  },
  inflationRate: {
    name: 'Inflation YOY',
    data: {
      usInflationRate: {
        document: 'qundal_inflation_rate__usa_value',
        url: 'RATEINF/INFLATION_USA',
        provider: 'quandl',
        name: 'USA',
      },
      euInflationRate: {
        document: 'qundal_inflation_rate__euro_area_value',
        url: 'RATEINF/INFLATION_EUR',
        provider: 'quandl',
        name: 'Europe',
      },
      ukInflationRate: {
        document: 'qundal_inflation_rate__uk_value',
        url: 'RATEINF/INFLATION_GBR',
        provider: 'quandl',
        name: 'UK',
      },
      jpInflationRate: {
        document: 'qundal_inflation_rate__japan_value',
        url: 'RATEINF/INFLATION_CAN',
        provider: 'quandl',
        name: 'Canada',
      },
      caInflationRate: {
        document: 'qundal_inflation_rate__canada_value',
        url: 'RATEINF/INFLATION_JPN',
        provider: 'quandl',
        name: 'Japan',
      },
      cheInflationRate: {
        document: 'qundal_inflation_rate__switzerland_value',
        url: 'RATEINF/INFLATION_CHE',
        provider: 'quandl',
        name: 'Switzerland',
      },
      rusInflationRate: {
        document: 'qundal_inflation_rate__russia_value',
        url: 'RATEINF/INFLATION_RUS',
        provider: 'quandl',
        name: 'Russia',
      },
      ausInflationRate: {
        document: 'qundal_inflation_rate__australia_value',
        url: 'RATEINF/INFLATION_AUS',
        provider: 'quandl',
        name: 'Australia',
      },
      gerInflationRate: {
        document: 'qundal_inflation_rate__germany_value',
        url: 'RATEINF/INFLATION_DEU',
        provider: 'quandl',
        name: 'Germany',
      },
      fraInflationRate: {
        document: 'qundal_inflation_rate__france_value',
        url: 'RATEINF/INFLATION_FRA',
        provider: 'quandl',
        name: 'France',
      },
      itaInflationRate: {
        document: 'qundal_inflation_rate__italy_value',
        url: 'RATEINF/INFLATION_ITA',
        provider: 'quandl',
        name: 'Italy',
      },
      nzlInflationRate: {
        document: 'qundal_inflation_rate__new_zealand_value',
        url: 'RATEINF/INFLATION_NZL',
        provider: 'quandl',
        name: 'New Zealand',
      },
    },
  },
  bitcoin: {
    name: 'Bitcoin',
    data: {
      marketCap: {
        document: 'qundal_bitcoin_market_cap_value',
        url: 'BCHAIN/MKTCP',
        provider: 'quandl',
        name: 'Market cap',
      },
      tradingVolume: {
        document: 'qundal_bitcoin_trading_volume_value',
        url: 'BCHAIN/TRVOU',
        provider: 'quandl',
        name: 'Traiding volume',
      },
      transactionFees: {
        document: 'qundal_bitcoin_transaction_fees_value',
        url: 'BCHAIN/TRFUS',
        provider: 'quandl',
        name: 'Transaction fees',
      },
      transactionTime: {
        document: 'qundal_bitcoin_transaction_time_value',
        url: 'BCHAIN/ATRCT',
        provider: 'quandl',
        name: 'Transaction time',
      },
      transactionCost: {
        document: 'qundal_bitcoin_transaction_cost_value',
        url: 'BCHAIN/CPTRA',
        provider: 'quandl',
        name: 'Transaction cost',
      },
      dailyTransactions: {
        document: 'qundal_bitcoin_daily_transactions_value',
        url: 'BCHAIN/NTRAN',
        provider: 'quandl',
        name: 'Daily transactions',
      },
    },
  },
} as const;

export type MarketOverviewDatabaseKeys = keyof typeof MARKET_OVERVIEW_DATABASE_ENDPOINTS;

export const MARKET_OVERVIEW_DATA = Object.entries(MARKET_OVERVIEW_DATABASE_ENDPOINTS).reduce(
  (acc, cur) => {
    const key = cur[0] as MarketOverviewDatabaseKeys;
    const { name, data } = cur[1]; //as { [key: string]: MarketOverviewDatabaseEndpointBody };

    const result = Object.entries(data).reduce(
      (acc2, cur2) => {
        const subKey = cur2[0]; // example: 'peRatio', 'shillerPeRatio', ...
        const subKeyName = `${name} - ${cur2[1].name}`;
        return [...acc2, { key, subKey, name: subKeyName }];
      },
      [] as { key: MarketOverviewDatabaseKeys; subKey: string; name: string }[],
    );

    return [
      ...acc,
      {
        key,
        name,
        data: result,
      },
    ];
  },
  [] as {
    key: MarketOverviewDatabaseKeys;
    name: string;
    data: {
      key: MarketOverviewDatabaseKeys;
      subKey: string;
      name: string;
    }[];
  }[],
);

export const getMarketOverKeyBySubKey = <T extends MarketOverviewDatabaseKeys>(
  subKey: string,
): {
  key: T;
  name: string;
  subKey: string;
} | null => {
  const section = MARKET_OVERVIEW_DATA.find((overview) => overview.data.find((d) => d.subKey === subKey));
  const data = section?.data.find((d) => d.subKey === subKey);

  if (!section || !data) {
    return null;
  }

  return {
    key: section.key as T,
    name: data.name,
    subKey,
  };
};

export const MARKET_OVERVIEW_DATABASE_KEYS = Object.entries(MARKET_OVERVIEW_DATABASE_ENDPOINTS)
  .map(([key, value]) => {
    const subkeys = Object.keys(value.data)
      .map((d) => ({ [d]: d }))
      .reduce((acc2, cur2) => ({ ...acc2, ...cur2 }), {});
    const result = {
      [key]: {
        ...subkeys,
      },
    } as {
      [K in MarketOverviewDatabaseKeys]: {
        [S in keyof (typeof MARKET_OVERVIEW_DATABASE_ENDPOINTS)[K]['data']]: S;
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
