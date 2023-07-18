import {
  CompanyOutlook,
  CompanyProfile,
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

export type StockDetails = {
  reloadData: boolean;
  companyOutlook: Omit<CompanyOutlook, 'profile'>;
  esgDataRatingYearlyArray: ESGDataRatingYearly[];
  esgDataRatingYearly: ESGDataRatingYearly | null;
  esgDataQuarterlyArray: ESGDataQuarterly[];
  esgDataQuarterly: ESGDataQuarterly | null;
  upgradesDowngrades: UpgradesDowngrades[];
  priceTarget: PriceTarget[];
  stockEarnings: StockEarning[];
  sectorPeers: SectorPeers[];
  recommendationTrends: RecommendationTrends[];
  lastUpdate: {
    detailsLastUpdate: string;
    earningLastUpdate: string;
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
