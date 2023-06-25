export type QuandlData = {
  id: number;
  dataset_code: string;
  database_code: string;
  name: string;
  description: string;
  refreshed_at: string;
  newest_available_date: string;
  oldest_available_date: string;
  column_names: string[];
  frequency: string;
  type: string;
  premium: boolean;
  limit: any;
  transform: any;
  column_index: any;
  start_date: string;
  end_date: string;
  //  ['2022-04-20', 42, 10, 20, 30];
  data: [string, number, ...number[]];
};

export const QUANDL_ENDPOINTS = [
  {
    name: 'S&P 500',
    key: 'sp500',
    main: [
      {
        quandlKey: 'MULTPL/SP500_PE_RATIO_MONTH',
        name: 'S&P 500 - PE ratio',
        documentKey: 'qundal_sp_500_pe_ratio_by_month_value',
      },
      {
        quandlKey: 'MULTPL/SHILLER_PE_RATIO_MONTH',
        name: 'S&P 500 - Shiller PE',
        documentKey: 'qundal_shiller_pe_ratio_by_month_value',
      },
      {
        quandlKey: 'MULTPL/SP500_BVPS_QUARTER',
        name: 'S&P 500 - Book value',
        documentKey: 'qundal_sp_500_book_value_per_share_by_quarter_value',
      },
      {
        quandlKey: 'MULTPL/SP500_PBV_RATIO_QUARTER',
        name: 'S&P 500 - Price to book',
        documentKey: 'qundal_sp_500_price_to_book_value_by_quarter_value',
      },
      {
        quandlKey: 'MULTPL/SP500_REAL_SALES_QUARTER',
        name: 'S&P 500 - Sales',
        documentKey: 'qundal_sp_500_real_sales_by_quarter_value',
      },
      {
        quandlKey: 'MULTPL/SP500_REAL_SALES_GROWTH_QUARTER',
        name: 'S&P 500 - Sales growth',
        documentKey: 'qundal_sp_500_real_sales_growth_by_quarter_value',
      },
      {
        quandlKey: 'MULTPL/SP500_PSR_QUARTER',
        name: 'S&P 500 - Price to sale',
        documentKey: 'qundal_sp_500_price_to_sales_ratio_by_quarter_value',
      },
      {
        quandlKey: 'MULTPL/SP500_EARNINGS_MONTH',
        name: 'S&P 500 - Earnings',
        documentKey: 'qundal_sp_500_earnings_by_month_value',
      },
      {
        quandlKey: 'MULTPL/SP500_EARNINGS_GROWTH_QUARTER',
        name: 'S&P 500 - Earnings growth',
        documentKey: 'qundal_sp_500_earnings_growth_rate_by_quarter_value',
      },
      {
        quandlKey: 'MULTPL/SP500_EARNINGS_YIELD_MONTH',
        name: 'S&P 500 - Earnings yield',
        documentKey: 'qundal_sp_500_earnings_yield_by_month_value',
      },
      {
        quandlKey: 'MULTPL/SP500_DIV_YIELD_MONTH',
        name: 'S&P 500 - Dividend yield',
        documentKey: 'qundal_sp_500_dividend_yield_by_month_value',
      },
      {
        quandlKey: 'MULTPL/SP500_DIV_MONTH',
        name: 'S&P 500 - Dividends',
        documentKey: 'qundal_sp_500_dividend_by_month_value',
      },
      {
        quandlKey: 'MULTPL/SP500_DIV_GROWTH_QUARTER',
        name: 'S&P 500 - Dividend growth',
        documentKey: 'qundal_sp_500_dividend_growth_by_quarter_value',
      },
    ],
  },
  {
    name: 'Bonds',
    key: 'bonds',
    main: [
      {
        quandlKey: 'ML/AAAEY',
        name: 'Bond - US AAA yield',
        documentKey: 'qundal_us_aaa_rated_bond_index_yield_bamlc0a1caaaey',
      },
      {
        quandlKey: 'ML/AAY',
        name: 'Bond - US AA yield',
        documentKey: 'qundal_us_aa_bond_index_yield_bamlc0a2caaey',
      },
      {
        quandlKey: 'ML/AEY',
        name: 'Bond - US A yield',
        documentKey: 'qundal_us_corporate_bond_a_rated_index_yield_bamlc0a3caey',
      },
      {
        quandlKey: 'ML/BBY',
        name: 'Bond - US BB yield',
        documentKey: 'qundal_us_high_yield_bb_corporate_bond_index_yield_bamlh0a1hybbey',
      },
      {
        quandlKey: 'ML/BEY',
        name: 'Bond - US B yield',
        documentKey: 'qundal_us_b_rated_corporate_bond_index_yield_bamlh0a2hybey',
      },
      {
        quandlKey: 'ML/CCCY',
        name: 'Bond - US CCC yield',
        documentKey: 'qundal_us_cccrated_bond_index_yield_bamlh0a3hycey',
      },
      {
        quandlKey: 'ML/USEY',
        name: 'Bond - US yield',
        documentKey: 'qundal_us_corporate_bond_index_yield_bamlc0a0cmey',
      },
      {
        quandlKey: 'ML/USTRI',
        name: 'Bond - US high yield',
        documentKey: 'qundal_us_high_yield_corporate_bond_index_yield_bamlh0a0hym2ey',
      },
      {
        quandlKey: 'ML/EEMCBI',
        name: 'Bond - Euro emerging markets yield',
        documentKey: 'qundal_euro_emerging_markets_corporate_bond_index_yield_bamlemebcrpieey',
      },
      {
        quandlKey: 'ML/EMHYY',
        name: 'Bond - Emerging markets high yield',
        documentKey: 'qundal_emerging_markets_high_yield_corporate_bond_index_yield_bamlemhbhycrpiey',
      },
    ],
  },
  {
    name: 'Treasury yield',
    key: 'treasury_yield',
    main: [
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 1 MO',
        documentKey: 'qundal_treasury_yield_curve_rates_1_mo',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 2 MO',
        documentKey: 'qundal_treasury_yield_curve_rates_2_mo',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 3 MO',
        documentKey: 'qundal_treasury_yield_curve_rates_3_mo',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 6 MO',
        documentKey: 'qundal_treasury_yield_curve_rates_6_mo',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 1 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_1_yr',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 2 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_2_yr',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 3 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_2_yr',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 5 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_5_yr',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 7 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_7_yr',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 10 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_10_yr',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 20 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_20_yr',
      },
      {
        quandlKey: 'USTREASURY/YIELD',
        name: 'Treasury yield 30 YR',
        documentKey: 'qundal_treasury_yield_curve_rates_30_yr',
      },
    ],
  },
  {
    name: 'Consumer price index states',
    key: 'consumer_price_index_states',
    main: [
      {
        quandlKey: 'RATEINF/CPI_USA',
        name: 'Consumer price index - USA',
        documentKey: 'qundal_consumer_price_index__usa_value',
      },
      {
        quandlKey: 'RATEINF/CPI_EUR',
        name: 'Consumer price index - Europe',
        documentKey: 'qundal_consumer_price_index__euro_area_value',
      },
      {
        quandlKey: 'RATEINF/CPI_GBR',
        name: 'Consumer price index - UK',
        documentKey: 'qundal_consumer_price_index__uk_value',
      },
      {
        quandlKey: 'RATEINF/CPI_JPN',
        name: 'Consumer price index - Japan',
        documentKey: 'qundal_consumer_price_index__japan_value',
      },
      {
        quandlKey: 'RATEINF/CPI_CAN',
        name: 'Consumer price index - Canada',
        documentKey: 'qundal_consumer_price_index__canada_value',
      },
      {
        quandlKey: 'RATEINF/CPI_CHE',
        name: 'Consumer price index - Switzerland',
        documentKey: 'qundal_consumer_price_index__switzerland_value',
      },
      {
        quandlKey: 'RATEINF/CPI_RUS',
        name: 'Consumer price index - Russia',
        documentKey: 'qundal_consumer_price_index__russia_value',
      },
      {
        quandlKey: 'RATEINF/CPI_AUS',
        name: 'Consumer price index - Australia',
        documentKey: 'qundal_consumer_price_index__australia_value',
      },
      {
        quandlKey: 'RATEINF/CPI_DEU',
        name: 'Consumer price index - Germany',
        documentKey: 'qundal_consumer_price_index__germany_value',
      },
      {
        quandlKey: 'RATEINF/CPI_FRA',
        name: 'Consumer price index - France',
        documentKey: 'qundal_consumer_price_index__france_value',
      },
      {
        quandlKey: 'RATEINF/CPI_ITA',
        name: 'Consumer price index - Italy',
        documentKey: 'qundal_consumer_price_index__italy_value',
      },
      {
        quandlKey: 'RATEINF/CPI_NZL',
        name: 'Consumer price index - New Zealand',
        documentKey: 'qundal_consumer_price_index__new_zealand_value',
      },
    ],
  },
  {
    name: 'Inflation rate',
    key: 'inflation_rate',
    main: [
      {
        quandlKey: 'RATEINF/INFLATION_USA',
        name: 'Inflation YOY - USA',
        documentKey: 'qundal_inflation_yoy__usa_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_EUR',
        name: 'Inflation YOY - Europe',
        documentKey: 'qundal_inflation_yoy__euro_area_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_GBR',
        name: 'Inflation YOY - UK',
        documentKey: 'qundal_inflation_yoy__uk_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_CAN',
        name: 'Inflation YOY - Canada',
        documentKey: 'qundal_inflation_yoy__canada_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_JPN',
        name: 'Inflation YOY - Japan',
        documentKey: 'qundal_inflation_yoy__japan_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_CHE',
        name: 'Inflation YOY - Switzerland',
        documentKey: 'qundal_inflation_yoy__switzerland_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_RUS',
        name: 'Inflation YOY - Russia',
        documentKey: 'qundal_inflation_yoy__russia_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_AUS',
        name: 'Inflation YOY - Australia',
        documentKey: 'qundal_inflation_yoy__australia_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_ARG',
        name: 'Inflation YOY - Argentina',
        documentKey: 'qundal_inflation_yoy__argentina_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_DEU',
        name: 'Inflation YOY - Germany',
        documentKey: 'qundal_inflation_yoy__germany_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_FRA',
        name: 'Inflation YOY - France',
        documentKey: 'qundal_inflation_yoy__france_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_ITA',
        name: 'Inflation YOY - Italy',
        documentKey: 'qundal_inflation_yoy__italy_value',
      },
      {
        quandlKey: 'RATEINF/INFLATION_NZL',
        name: 'Inflation YOY - New Zealand',
        documentKey: 'qundal_inflation_yoy__new_zealand_value',
      },
    ],
  },
  {
    name: 'Bitcoin',
    key: 'bitcoin',
    main: [
      {
        quandlKey: 'BCHAIN/MKTCP',
        name: 'Market cap',
        documentKey: 'qundal_bitcoin_market_capitalization_value',
      },
      {
        quandlKey: 'BCHAIN/TRVOU',
        name: 'Traiding volume',
        documentKey: 'qundal_bitcoin_usd_exchange_trade_volume_value',
      },
      {
        quandlKey: 'BCHAIN/TRFUS',
        name: 'Transaction fees',
        documentKey: 'qundal_bitcoin_total_transaction_fees_usd_value',
      },
      {
        quandlKey: 'BCHAIN/ATRCT',
        name: 'Transaction time',
        documentKey: 'qundal_bitcoin_median_transaction_confirmation_time_value',
      },
      {
        quandlKey: 'BCHAIN/CPTRA',
        name: 'Transaction cost',
        documentKey: 'qundal_bitcoin_cost_per_transaction_value',
      },
      {
        quandlKey: 'BCHAIN/NTRAN',
        name: 'Daily transactions',
        documentKey: 'qundal_bitcoin_number_of_transactions_value',
      },
    ],
  },
] as const;
