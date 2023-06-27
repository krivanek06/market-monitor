import { MARKET_OVERVIEW_DATABASE_ENDPOINTS, MarketOverviewData, QuandlData } from '@market-monitor/api-types';
import axios from 'axios';
import { QUANDL_KEY, QUANDL_URL } from './environments';

const getQuandlDataGeneric = async (endpoint: string): Promise<QuandlData> => {
  try {
    // url return a HTML string
    const response = await axios.get<string | QuandlData>(`${QUANDL_URL}/${endpoint}?api_key=${QUANDL_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // parse out the json string from HTML
    if (typeof response.data === 'string') {
      const regex = /"dataset"\s*:\s*({[^}]+})/;
      const match = response.data.match(regex);
      if (match) {
        const datasetObject = JSON.parse(match[1]);
        return datasetObject;
      }
      throw new Error('no match found');
    }

    return response.data;
  } catch (e) {
    console.log('error in getQuandlDataGeneric', e);
    throw e;
  }
};

const formatData = (data: QuandlData, values?: number[], dataLimit = 320): MarketOverviewData => {
  return {
    name: data.name,
    start_date: data.start_date,
    frequency: data.frequency,
    end_date: data.end_date,
    lastUpdate: new Date().toISOString(),
    dates: data.data.map((date) => date[0]).slice(0, dataLimit),
    data: (values ?? data.data.map((date) => date[1])).slice(0, dataLimit),
  };
};

export const getQuandlDataFormatter = async (endpoint: string): Promise<MarketOverviewData> => {
  const data = await getQuandlDataGeneric(endpoint);
  return formatData(data);
};

// ------------------- SP500 -------------------

export const getSP500PE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.peRatio.url);
};

export const getSP500ShillerPE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.shillerPeRatio.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500BookValue = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.bookValue.url);
};

export const getSP500PriceToBook = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.priceToBook.url);
};

export const getSP500SalesQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.sales.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500SalesGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.salesGrowth.url);
};

export const getSP500PriceToSales = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.priceToSales.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500EarningsByMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.earnings.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500EarningsGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.earningsGrowth.url);
};

export const getSP500EarningsYieldMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.earningsYield.url);
};

export const getSP500DividendYieldMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.dividendYield.url);
};

/**
 * @deprecated - maybe - last data 2022-03-31
 * @returns
 */
export const getSP500DividendMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.dividend.url);
};

export const getSP500DividendGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.sp500.dividendGrowth.url);
};

// ------------------- Bonds -------------------

export const getBondAAAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usAAAYield.url);
};

export const getBondAAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usAAYield.url);
};

export const getBondAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usAYield.url);
};

export const getBondBBYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usBBYield.url);
};

export const getBondBYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usBYield.url);
};

export const getBondCCCYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usCCCYield.url);
};

export const getBondCorporateYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usCorporateYield.url);
};

export const getBondHighYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usHighYield.url);
};

export const getBondEmergingMarketHighYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bonds.usEmergingMarket.url);
};

// ------------------- Treasury yield -------------------

/**
 * columns:
 *  -- "Date",  "1 MO",  "2 MO",  "3 MO",  "6 MO",  "1 YR",  "2 YR",  "3 YR",  "5 YR",  "7 YR",  "10 YR",  "20 YR",  "30 YR"
 */
export const getTreasuryYieldUS = async (): Promise<MarketOverviewData[]> => {
  const quandlData = await getQuandlDataGeneric(MARKET_OVERVIEW_DATABASE_ENDPOINTS.treasury.us10Year.url);

  // format data for each column, remove first column (date)
  const result = quandlData.column_names
    .map((_, index) => {
      const dataToBeFormatted = quandlData.data.map((data) => data[index]);
      return formatData(quandlData, dataToBeFormatted, 2000);
    })
    .slice(1);

  return result;
};

// ------------------- Consumer Price Index -------------------

export const getConsumerPriceIndexUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.usCpi.url);
};

export const getConsumerPriceIndexEU = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.euCpi.url);
};

export const getConsumerPriceIndexUK = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.ukCpi.url);
};

export const getConsumerPriceIndexJP = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.jpCpi.url);
};

export const getConsumerPriceIndexCAN = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.caCpi.url);
};

export const getConsumerPriceIndexCHE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.cheCpi.url);
};

export const getConsumerPriceIndexRUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.rusCpi.url);
};

export const getConsumerPriceIndexAUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.ausCpi.url);
};

export const getConsumerPriceIndexDE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.gerCpi.url);
};

export const getConsumerPriceIndexFR = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.fraCpi.url);
};

export const getConsumerPriceIndexITA = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.itaCpi.url);
};

export const getConsumerPriceIndexNZL = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.consumerIndex.nzlCpi.url);
};

// ------------------- Inflation Rate -------------------

export const getInflationRateUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.usInflationRate.url);
};

export const getInflationRateEU = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.euInflationRate.url);
};

export const getInflationRateUK = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.ukInflationRate.url);
};

export const getInflationRateCAN = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.caInflationRate.url);
};

export const getInflationRateJP = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.jpInflationRate.url);
};

export const getInflationRateCHE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.cheInflationRate.url);
};

export const getInflationRateRUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.rusInflationRate.url);
};

export const getInflationRateAUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.ausInflationRate.url);
};

export const getInflationRateDE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.gerInflationRate.url);
};

export const getInflationRateFR = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.fraInflationRate.url);
};

export const getInflationRateITA = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.itaInflationRate.url);
};

export const getInflationRateNZL = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.inflationRate.nzlInflationRate.url);
};

// ------------------- Bitcoin -------------------

export const getBitcoinMarketCap = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bitcoin.marketCap.url);
};

export const getBitcoinTradingVolume = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bitcoin.tradingVolume.url);
};

export const getBitcoinTransactionFees = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bitcoin.transactionFees.url);
};

export const getBitcoinTransactionTime = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bitcoin.transactionTime.url);
};

export const getBitcoinTransactionCost = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bitcoin.transactionTime.url);
};

export const getBitcoinDailyTransactions = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_ENDPOINTS.bitcoin.dailyTransactions.url);
};
