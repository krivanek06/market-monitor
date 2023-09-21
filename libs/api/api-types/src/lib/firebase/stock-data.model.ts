import { DataTimePeriodEnum } from '../constants';
import {
  CompanyKeyMetrics,
  CompanyKeyMetricsTTM,
  CompanyOutlook,
  CompanyProfile,
  CompanyRating,
  CompanyRatio,
  CompanyRatioTTM,
  ESGDataQuarterly,
  ESGDataRatingYearly,
  EnterpriseValue,
  PriceChange,
  PriceTarget,
  RecommendationTrends,
  SectorPeers,
  StockEarning,
  SymbolQuote,
  UpgradesDowngrades,
} from '../external-api';

export type StockSummary = {
  id: string;
  quote: SymbolQuote;
  profile?: CompanyProfile;
  priceChange: PriceChange;
};

export type StockDetailsAPI = {
  ratio: CompanyRatioTTM | null;
  rating: CompanyRating | null;
  companyOutlook: CompanyOutlook;
  esgDataRatingYearlyArray: ESGDataRatingYearly[];
  esgDataRatingYearly: ESGDataRatingYearly | null;
  esgDataQuarterlyArray: ESGDataQuarterly[];
  esgDataQuarterly: ESGDataQuarterly | null;
  upgradesDowngrades: UpgradesDowngrades[];
  priceTarget: PriceTarget[];
  stockEarnings: StockEarning[];
  sectorPeers: SectorPeers | null;
  recommendationTrends: RecommendationTrends[];
  companyKeyMetricsTTM: CompanyKeyMetricsTTM;
  enterpriseValue: EnterpriseValue[];
  additionalFinancialData: {
    revenue: number | null;
    costOfRevenue: number | null;
    EBITDA: number | null;
    netIncome: number | null;
    totalAssets: number | null;
    totalCurrentAssets: number | null;
    totalDebt: number | null;
    shortTermDebt: number | null;
    cashOnHand: number | null;
    freeCashFlow: number | null;
    operatingCashFlow: number | null;
    stockBasedCompensation: number | null;
    dividends: StockDetailsDividends | null;
  };
};

export type StockDetailsDividends = {
  dividendsPaid: number;
  dividendYielPercentageTTM: number;
  dividendYielTTM: number;
  payoutRatioTTM: number;
  dividendPerShareTTM: number;
};

export type StockMetricsHistoricalAPI = {
  [DataTimePeriodEnum.QUARTER]: {
    ratios: CompanyRatio[];
    keyMetrics: CompanyKeyMetrics[];
  };
  [DataTimePeriodEnum.YEAR]: {
    ratios: CompanyRatio[];
    keyMetrics: CompanyKeyMetrics[];
  };
  lastUpdate: string;
};

export enum SymbolHistoricalPeriods {
  day = '1d',
  week = '1w',
  month = '1mo',
  threeMonths = '3mo',
  sixMonths = '6mo',
  year = '1y',
  fiveYears = '5y',
  ytd = 'ytd',
  all = 'all',
}

export const SymbolHistoricalPeriodsArrayPreload = [
  SymbolHistoricalPeriods.day,
  SymbolHistoricalPeriods.week,
  SymbolHistoricalPeriods.month,
  SymbolHistoricalPeriods.sixMonths,
  SymbolHistoricalPeriods.year,
  SymbolHistoricalPeriods.fiveYears,
];
