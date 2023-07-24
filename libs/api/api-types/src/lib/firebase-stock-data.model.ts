import { ChangeFields, ForcefullyOmit } from '@market-monitor/shared-utils-general';
import {
  CompanyKeyMetricsTTM,
  CompanyOutlook,
  CompanyProfile,
  CompanyRating,
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
  quote: SymbolQuote;
  profile: CompanyProfile;
  priceChange: PriceChange;
  summaryLastUpdate: string;
};

export type StockDetailsAPI = {
  reloadData: boolean;
  companyOutlook: CompanyOutlook;
  esgDataRatingYearlyArray: ESGDataRatingYearly[];
  esgDataRatingYearly: ESGDataRatingYearly | null;
  esgDataQuarterlyArray: ESGDataQuarterly[];
  esgDataQuarterly: ESGDataQuarterly | null;
  upgradesDowngrades: UpgradesDowngrades[];
  priceTarget: PriceTarget[];
  stockEarnings: StockEarning[];
  sectorPeers: SectorPeers;
  recommendationTrends: RecommendationTrends[];
  companyKeyMetricsTTM: CompanyKeyMetricsTTM;
  enterpriseValue: EnterpriseValue[];
  lastUpdate: {
    detailsLastUpdate: string;
    earningLastUpdate: string;
  };
};

export type StockDetails = StockSummary &
  ChangeFields<
    StockDetailsAPI,
    {
      companyOutlook: ForcefullyOmit<CompanyOutlook, 'ratios' | 'rating'>;
    }
  > & {
    ratio: CompanyRatio;
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

export type StockDetailsDividends = {
  dividendsPaid: number;
  dividendYielPercentageTTM: number;
  dividendYielTTM: number;
  payoutRatioTTM: number;
  dividendPerShareTTM: number;
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
