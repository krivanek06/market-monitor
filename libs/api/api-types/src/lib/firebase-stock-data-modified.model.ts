import { StockDetailsAPI, StockSummary } from './firebase-stock-data.model';

export type StockDetails = StockSummary & StockDetailsAPI;

export type StockMetricsHistoricalBasic = {
  dates: string[];
  marketCap: number[];
  enterpriseValue: number[];
  ratios: {
    peRatio: number[];
    currentRatio: number[];
    quickRatio: number[];
    cashRatio: number[];
    priceToSalesRatio: number[];
    pocfratio: number[];
    pfcfRatio: number[];
    pbRatio: number[];
    debtRatio: number[];
    debtToEquity: number[];
    debtToAssets: number[];
    dividendYield: number[];
    stockBasedCompensationToRevenue: number[];
  };
  margin: {
    netProfitMargin: number[];
    grossProfitMargin: number[];
  };
  dividends: {
    dividendPayoutRatio: number[];
    dividendYield: number[];
  };
  perShare: {
    revenuePerShare: number[];
    netIncomePerShare: number[];
    cashPerShare: number[];
    freeCashFlowPerShare: number[];
    bookValuePerShare: number[];
  };
};
