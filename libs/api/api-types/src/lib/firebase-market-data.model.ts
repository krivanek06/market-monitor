import { MostPerformingStocks, PriceChange } from './external-api/financial-modeling-starter.model';
import { StockSummary } from './firebase-stock-data.model';

export type MarketTopPerformance<T> = {
  stockTopGainers: T[];
  stockTopLosers: T[];
  stockTopActive: T[];
  sp500Change: PriceChange;
  lastUpdate: string;
};

export type MarketTopPerformanceOverview = MarketTopPerformance<MostPerformingStocks> & {};

export type MarketTopPerformanceOverviewResponse = MarketTopPerformance<StockSummary> & {};

// ------------------ News ------------------

export const firebaseNewsAcceptableTypes = ['general', 'stocks', 'forex', 'crypto'] as const;
export type FirebaseNewsTypes = (typeof firebaseNewsAcceptableTypes)[number];

// ------------------ Market Overview ------------------

export type MarketOverview = {
  sp500: {
    peRatio: MarketOverviewData[];
    shillerPeRatio: MarketOverviewData[];
    priceToBook: MarketOverviewData[];
    priceToSales: MarketOverviewData[];
    earningsYield: MarketOverviewData[];
    dividendYield: MarketOverviewData[];
  };
  treasury: {
    us1Month: MarketOverviewData[];
    us3Month: MarketOverviewData[];
    us1Year: MarketOverviewData[];
    us5Year: MarketOverviewData[];
    us10Year: MarketOverviewData[];
    us30Year: MarketOverviewData[];
  };
  bonds: {
    usAAAYield: MarketOverviewData[];
    usAAYield: MarketOverviewData[];
    usBBYield: MarketOverviewData[];
    usCCCYield: MarketOverviewData[];
    usCorporateYield: MarketOverviewData[];
    usHighYield: MarketOverviewData[];
    usEmergingMarket: MarketOverviewData[];
  };
  consumerPriceIndex: {
    usCpi: MarketOverviewData[];
    euCpi: MarketOverviewData[];
    ukCpi: MarketOverviewData[];
    gerCpi: MarketOverviewData[];
  };
  inflationRate: {
    usInflationRate: MarketOverviewData[];
    euInflationRate: MarketOverviewData[];
    ukInflationRate: MarketOverviewData[];
    gerInflationRate: MarketOverviewData[];
  };
};

export type MarketOverviewData = {
  data: number[];
  dates: string[];
  frequency: string;
  start_date: string;
  end_date: string;
  lastUpdate: string;
};
