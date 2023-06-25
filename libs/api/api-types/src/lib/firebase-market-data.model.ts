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

export type MarketOverviewData = {
  name: string;
  description: string;
  data: [string, number];
  frequency: string;
  start_date: string;
  end_date: string;
};
