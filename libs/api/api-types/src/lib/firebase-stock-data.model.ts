import {
  AnalystEstimatesEarnings,
  CompanyOutlook,
  ESGDataQuarterly,
  ESGDataRatingYearly,
  News,
  PriceChange,
  PriceTarget,
  Profile,
  SectorPeers,
  SymbolQuote,
  UpgradesDowngrades,
} from './external-api/financial-modeling-starter.model';
import { RecommendationTrends } from './external-api/finnhub.model';

export type StockSummary = {
  id: string;
  reloadData: boolean;
  quote: SymbolQuote;
  profile: Profile;
  priceChange: PriceChange;
  summaryLastUpdate: string;
};

export type StockDetails = {
  reloadData: boolean;
  companyOutlook: Omit<CompanyOutlook, 'profile'>;
  esgDataRatingYearlyArray: ESGDataRatingYearly[];
  esgDataRatingYearly: ESGDataRatingYearly | null;
  esgDataQuarterlyArray: ESGDataQuarterly[];
  esgDataQuarterly: ESGDataQuarterly | null;
  upgradesDowngrades: UpgradesDowngrades[];
  priceTarget: PriceTarget[];
  analystEstimatesEarnings: AnalystEstimatesEarnings[];
  sectorPeers: SectorPeers[];
  recommendationTrends: RecommendationTrends[];
  stockNews: News[];
  lastUpdate: {
    newsLastUpdate: string;
    detailsLastUpdate: string;
  };
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
