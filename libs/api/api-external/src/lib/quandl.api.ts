import { MarketOverviewData, QuandlData } from '@market-monitor/api-types';
import axios from 'axios';
import { QUANDL_KEY, QUANDL_URL } from './environments';

type QuandlResponse = { dataset: QuandlData } | { quandl_error: { message: string } };

const getQuandlDataGeneric = async (endpoint: string): Promise<QuandlData> => {
  const response = await axios.get<QuandlResponse>(`${QUANDL_URL}/${endpoint}?api_key=${QUANDL_KEY}`);

  // received error from server
  if ('quandl_error' in response.data) {
    throw new Error(response.data.quandl_error.message);
  }

  return response.data.dataset;
};

const getQuandlDataFormatter = async (endpoint: string): Promise<MarketOverviewData> => {
  const data = await getQuandlDataGeneric(endpoint);
  return formatData(data);
};

const formatData = (data: QuandlData, values?: number[]): MarketOverviewData => {
  return {
    start_date: data.start_date,
    frequency: data.frequency,
    end_date: data.end_date,
    lastUpdate: new Date().toISOString(),
    dates: data.data.map((date) => date[0]),
    data: values ?? data.data.map((date) => date[1]),
  };
};

// ------------------- SP500 -------------------

export const getSP500PE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_PE_RATIO_MONTH');
};

export const getSP500ShillerPE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SHILLER_PE_RATIO_MONTH');
};

export const getSP500BookValue = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_BVPS_QUARTER');
};

export const getSP500PriceToBook = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_PBV_RATIO_QUARTER');
};

export const getSP500RealSalesQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_REAL_SALES_QUARTER');
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500RealSalesGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_REAL_SALES_GROWTH_QUARTER');
};

export const getSP500PriceToSales = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_PSR_QUARTER');
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500EarningsByMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_EARNINGS_MONTH');
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500EarningsGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_EARNINGS_GROWTH_QUARTER');
};

export const getSP500EarningsYieldMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_EARNINGS_YIELD_MONTH');
};

export const getSP500DividendYieldMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_DIV_YIELD_MONTH');
};

/**
 * @deprecated - maybe - last data 2022-03-31
 * @returns
 */
export const getSP500DividendMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_DIV_MONTH');
};

export const getSP500DividendGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('MULTPL/SP500_DIV_GROWTH_QUARTER');
};

// ------------------- Bonds -------------------

export const getBondAAAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/AAAEY');
};

export const getBondAAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/AAY');
};

export const getBondAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/AEY');
};

export const getBondBBYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/BBY');
};

export const getBondBYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/BEY');
};

export const getBondCCCYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/CCCY');
};

export const getBondCorporateYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/USEY');
};

export const getBondHighYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/USTRI');
};

export const getBondEmergingMarketHighYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('ML/EMHYY');
};

// ------------------- Treasury yield -------------------

/**
 * columns:
 *  -- "Date",  "1 MO",  "2 MO",  "3 MO",  "6 MO",  "1 YR",  "2 YR",  "3 YR",  "5 YR",  "7 YR",  "10 YR",  "20 YR",  "30 YR"
 */
export const getTreasuryYieldUS = async (): Promise<MarketOverviewData[]> => {
  const quandlData = await getQuandlDataGeneric('USTREASURY/YIELD');

  // format data for each column, remove first column (date)
  const result = quandlData.column_names
    .map((_, index) => {
      const dataToBeFormatted = quandlData.data.map((data) => data[index]);
      return formatData(quandlData, dataToBeFormatted);
    })
    .slice(1);

  return result;
};

// ------------------- Consumer Price Index -------------------

export const getConsumerPriceIndexUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_USA');
};

export const getConsumerPriceIndexEU = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_EU');
};

export const getConsumerPriceIndexUK = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_UK');
};

export const getConsumerPriceIndexJP = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_JPN');
};

export const getConsumerPriceIndexCAN = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_CAN');
};

export const getConsumerPriceIndexCHE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_CHE');
};

export const getConsumerPriceIndexRUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_RUS');
};

export const getConsumerPriceIndexAUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_AUS');
};

export const getConsumerPriceIndexDE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_DEU');
};

export const getConsumerPriceIndexFR = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_FRA');
};

export const getConsumerPriceIndexIT = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_ITA');
};

export const getConsumerPriceIndexNZL = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/CPI_NZL');
};

// ------------------- Inflation Rate -------------------

export const getInflationRateUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_USA');
};

export const getInflationRateEU = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_EUR');
};

export const getInflationRateUK = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_GBR');
};

export const getInflationRateCAN = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_CAN');
};

export const getInflationRateJP = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_JPN');
};

export const getInflationRateCHE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_CHE');
};

export const getInflationRateRUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_RUS');
};

export const getInflationRateAUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_AUS');
};

export const getInflationRateDE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_DEU');
};

export const getInflationRateFR = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_FRA');
};

export const getInflationRateIT = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_ITA');
};

export const getInflationRateNZL = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('RATEINF/INFLATION_NZL');
};

// ------------------- Bitcoin -------------------

export const getBitcoinMarketCap = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('BCHAIN/MKTCP');
};

export const getBitcoinTradingVolume = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('BCHAIN/TRVOU');
};

export const getBitcoinTransactionFees = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('BCHAIN/TRFUS');
};

export const getBitcoinTransactionTime = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('BCHAIN/ATRCT');
};

export const getBitcoinTransactionCost = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('BCHAIN/CPTRA');
};

export const getBitcoinDailyTransactions = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter('BCHAIN/NTRAN');
};
