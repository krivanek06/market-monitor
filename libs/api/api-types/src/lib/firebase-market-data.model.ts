import { MostPerformingStocks, PriceChange } from './financial-modeling-starter.model';
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

export const firebaseNewsAcceptableTypes = ['general', 'stocks', 'forex', 'crypto'] as const;
export type FirebaseNewsTypes = (typeof firebaseNewsAcceptableTypes)[number];
