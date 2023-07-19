import { ChangeFields } from '@market-monitor/shared-utils-general';
import {
  CompanyKeyMetrics as CompanyKeyMetricsTTM,
  CompanyOutlook,
  CompanyProfile,
  CompanyRating,
  CompanyRatio,
  ESGDataQuarterly,
  ESGDataRatingYearly,
  PriceChange,
  PriceTarget,
  SectorPeers,
  StockEarning,
  SymbolQuote,
  UpgradesDowngrades,
} from './external-api/financial-modeling-starter.model';
import { RecommendationTrends } from './external-api/finnhub.model';

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
  sectorPeers: SectorPeers[];
  recommendationTrends: RecommendationTrends[];
  companyKeyMetricsTTM: CompanyKeyMetricsTTM;
  lastUpdate: {
    detailsLastUpdate: string;
    earningLastUpdate: string;
  };
};

export type StockDetails = StockSummary &
  ChangeFields<
    StockDetailsAPI,
    {
      companyOutlook: Omit<CompanyOutlook, 'ratios' | 'rating'>;
    }
  > & {
    ratio: CompanyRatio;
    rating: CompanyRating;
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
