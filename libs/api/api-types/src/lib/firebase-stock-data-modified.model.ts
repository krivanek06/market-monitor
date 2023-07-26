import { ChangeFields, ForcefullyOmit } from '@market-monitor/shared-utils-general';
import { CompanyOutlook, CompanyRating, CompanyRatioTTM } from './external-api';
import { StockDetailsAPI, StockDetailsDividends, StockSummary } from './firebase-stock-data.model';

export type StockDetails = StockSummary &
  ChangeFields<
    StockDetailsAPI,
    {
      companyOutlook: ForcefullyOmit<CompanyOutlook, 'ratios' | 'rating'>;
    }
  > & {
    ratio: CompanyRatioTTM;
    rating: CompanyRating;
    additionalFinancialData: {
      revenue: number;
      costOfRevenue: number;
      EBITDA: number;
      netIncome: number;
      totalAssets: number;
      totalCurrentAssets: number;
      totalDebt: number;
      shortTermDebt: number;
      cashOnHand: number;
      freeCashFlow: number;
      operatingCashFlow: number;
      stockBasedCompensation: number;
      dividends: StockDetailsDividends;
    };
  };

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
