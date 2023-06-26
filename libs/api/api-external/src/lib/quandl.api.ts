import { MARKET_OVERVIEW_DATABASE_KEYS } from '@market-monitor/api-firebase';
import { MarketOverviewData, QuandlData } from '@market-monitor/api-types';
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
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.peRatio.url);
};

export const getSP500ShillerPE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.shillerPeRatio.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500BookValue = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.bookValue.url);
};

export const getSP500PriceToBook = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToBook.url);
};

export const getSP500SalesQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.sales.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500SalesGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.salesGrowth.url);
};

export const getSP500PriceToSales = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToSales.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500EarningsByMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.earnings.url);
};

/**
 * @deprecated - maybe - last data 2022-12-31
 * @returns
 */
export const getSP500EarningsGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsGrowth.url);
};

export const getSP500EarningsYieldMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsYield.url);
};

export const getSP500DividendYieldMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendYield.url);
};

/**
 * @deprecated - maybe - last data 2022-03-31
 * @returns
 */
export const getSP500DividendMonth = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividend.url);
};

export const getSP500DividendGrowthQuarter = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendGrowth.url);
};

// ------------------- Bonds -------------------

export const getBondAAAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAAYield.url);
};

export const getBondAAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAYield.url);
};

export const getBondAYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAYield.url);
};

export const getBondBBYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBBYield.url);
};

export const getBondBYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBYield.url);
};

export const getBondCCCYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCCCYield.url);
};

export const getBondCorporateYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCorporateYield.url);
};

export const getBondHighYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usHighYield.url);
};

export const getBondEmergingMarketHighYieldUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bonds.usEmergingMarket.url);
};

// ------------------- Treasury yield -------------------

/**
 * columns:
 *  -- "Date",  "1 MO",  "2 MO",  "3 MO",  "6 MO",  "1 YR",  "2 YR",  "3 YR",  "5 YR",  "7 YR",  "10 YR",  "20 YR",  "30 YR"
 */
export const getTreasuryYieldUS = async (): Promise<MarketOverviewData[]> => {
  const quandlData = await getQuandlDataGeneric(MARKET_OVERVIEW_DATABASE_KEYS.treasury.us10Year.url);

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
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.usCpi.url);
};

export const getConsumerPriceIndexEU = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.euCpi.url);
};

export const getConsumerPriceIndexUK = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.ukCpi.url);
};

export const getConsumerPriceIndexJP = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.jpCpi.url);
};

export const getConsumerPriceIndexCAN = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.caCpi.url);
};

export const getConsumerPriceIndexCHE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.cheCpi.url);
};

export const getConsumerPriceIndexRUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.rusCpi.url);
};

export const getConsumerPriceIndexAUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.ausCpi.url);
};

export const getConsumerPriceIndexDE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.gerCpi.url);
};

export const getConsumerPriceIndexFR = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.fraCpi.url);
};

export const getConsumerPriceIndexITA = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.itaCpi.url);
};

export const getConsumerPriceIndexNZL = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.consumerPriceIndex.nzlCpi.url);
};

// ------------------- Inflation Rate -------------------

export const getInflationRateUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.usInflationRate.url);
};

export const getInflationRateEU = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.euInflationRate.url);
};

export const getInflationRateUK = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ukInflationRate.url);
};

export const getInflationRateCAN = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.caInflationRate.url);
};

export const getInflationRateJP = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.jpInflationRate.url);
};

export const getInflationRateCHE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.cheInflationRate.url);
};

export const getInflationRateRUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.rusInflationRate.url);
};

export const getInflationRateAUS = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ausInflationRate.url);
};

export const getInflationRateDE = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.gerInflationRate.url);
};

export const getInflationRateFR = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.fraInflationRate.url);
};

export const getInflationRateITA = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.itaInflationRate.url);
};

export const getInflationRateNZL = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.nzlInflationRate.url);
};

// ------------------- Bitcoin -------------------

export const getBitcoinMarketCap = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.marketCap.url);
};

export const getBitcoinTradingVolume = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.tradingVolume.url);
};

export const getBitcoinTransactionFees = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionFees.url);
};

export const getBitcoinTransactionTime = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionTime.url);
};

export const getBitcoinTransactionCost = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionTime.url);
};

export const getBitcoinDailyTransactions = async (): Promise<MarketOverviewData> => {
  return getQuandlDataFormatter(MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.dailyTransactions.url);
};
