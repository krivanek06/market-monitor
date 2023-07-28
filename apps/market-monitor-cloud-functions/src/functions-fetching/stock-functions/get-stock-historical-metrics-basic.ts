import { getCompanyKeyMetrics, getCompanyRatios } from '@market-monitor/api-external';
import { getDatabaseStockMetricHistoricalRef } from '@market-monitor/api-firebase';
import {
  DataTimePeriod,
  DataTimePeriodEnum,
  StockMetricsHistoricalAPI,
  StockMetricsHistoricalBasic,
} from '@market-monitor/api-types';
import { isBefore, subDays } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

export const getstockhistoricalmetrics = onRequest(
  async (request, response: Response<StockMetricsHistoricalBasic | string>) => {
    const symbolString = (request.query.symbol as string) ?? '';
    const timePeriod = (request.query.period as DataTimePeriod) ?? DataTimePeriodEnum.QUARTER;

    // throw error if no symbols
    if (!symbolString) {
      response.status(400).send(`Not provided symbol in query param`);
      return;
    }

    // load data
    const data = await getStockHistoricalMetrics(symbolString);
    // format data
    const formattedData = formatData(data, timePeriod);
    // return data
    response.send(formattedData);
  }
);

const formatData = (data: StockMetricsHistoricalAPI, timePeriod: DataTimePeriod): StockMetricsHistoricalBasic => {
  const keyMetrics = data[timePeriod].keyMetrics.reverse();
  const ratios = data[timePeriod].ratios.reverse();

  return {
    dates: keyMetrics.map((d) => d.date),
    marketCap: keyMetrics.map((d) => d.marketCap),
    enterpriseValue: keyMetrics.map((d) => d.enterpriseValue),
    ratios: {
      peRatio: keyMetrics.map((d) => d.peRatio),
      currentRatio: keyMetrics.map((d) => d.currentRatio),
      quickRatio: ratios.map((d) => d.quickRatio),
      cashRatio: ratios.map((d) => d.cashRatio),
      priceToSalesRatio: keyMetrics.map((d) => d.priceToSalesRatio),
      pocfratio: keyMetrics.map((d) => d.pocfratio),
      pfcfRatio: keyMetrics.map((d) => d.pfcfRatio),
      pbRatio: keyMetrics.map((d) => d.pbRatio),
      debtRatio: ratios.map((d) => d.debtRatio),
      debtToEquity: keyMetrics.map((d) => d.debtToEquity),
      debtToAssets: keyMetrics.map((d) => d.debtToAssets),
      dividendYield: keyMetrics.map((d) => d.dividendYield),
      stockBasedCompensationToRevenue: keyMetrics.map((d) => d.stockBasedCompensationToRevenue),
    },
    margin: {
      netProfitMargin: ratios.map((d) => d.netProfitMargin),
      grossProfitMargin: ratios.map((d) => d.grossProfitMargin),
    },
    dividends: {
      dividendPayoutRatio: ratios.map((d) => d.dividendPayoutRatio),
      dividendYield: keyMetrics.map((d) => d.dividendYield),
    },
    perShare: {
      revenuePerShare: keyMetrics.map((d) => d.revenuePerShare),
      netIncomePerShare: keyMetrics.map((d) => d.netIncomePerShare),
      cashPerShare: keyMetrics.map((d) => d.cashPerShare),
      bookValuePerShare: keyMetrics.map((d) => d.bookValuePerShare),
      freeCashFlowPerShare: keyMetrics.map((d) => d.freeCashFlowPerShare),
    },
  };
};

const getStockHistoricalMetrics = async (symbol: string): Promise<StockMetricsHistoricalAPI> => {
  // get data from database
  const databaseRef = getDatabaseStockMetricHistoricalRef(symbol);
  const databaseData = (await databaseRef.get()).data();

  // check if data is not older than 7 days
  if (databaseData && !isBefore(new Date(databaseData.lastUpdate), subDays(new Date(), 7))) {
    return databaseData;
  }

  // get data from API
  const [keyMetricsQuarter, keyMetricsYear, ratiosQuarter, ratiosYear] = await Promise.all([
    getCompanyKeyMetrics(symbol, 'quarter'),
    getCompanyKeyMetrics(symbol, 'year'),
    getCompanyRatios(symbol, 'quarter'),
    getCompanyRatios(symbol, 'year'),
  ]);

  // construct result
  const result: StockMetricsHistoricalAPI = {
    quarter: {
      keyMetrics: keyMetricsQuarter,
      ratios: ratiosQuarter,
    },
    year: {
      keyMetrics: keyMetricsYear,
      ratios: ratiosYear,
    },
    lastUpdate: new Date().toISOString(),
  };

  // save data to database
  await databaseRef.set(result);

  // return data
  return result;
};
