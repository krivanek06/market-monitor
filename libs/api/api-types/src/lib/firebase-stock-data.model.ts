import { DataTimePeriodEnum } from './constants-symbols.model';
import {
  CompanyKeyMetrics,
  CompanyKeyMetricsTTM,
  CompanyOutlook,
  CompanyProfile,
  CompanyRatio,
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
} from './external-api';

export type StockSummary = {
  id: string;
  reloadData: boolean;
  reloadDetailsData: boolean;
  quote: SymbolQuote;
  profile: CompanyProfile;
  priceChange: PriceChange;
  summaryLastUpdate: string;
};

export type StockDetailsAPI = {
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
  lastUpdate: {
    detailsLastUpdate: string;
    earningLastUpdate: string;
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
/**
 * Stock data details from the pro api for pro members
 */
// export interface StockDataDetailsPro {}
