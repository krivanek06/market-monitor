import { MostPerformingStocks, PriceChange } from './financial-modeling-starter.model';
import { StockSummary } from './firebase-stock-data.model';

export type MarketOverTopStocks<T> = {
  stockTopGainers: T[];
  stockTopLosers: T[];
  stockTopActive: T[];
};

export type MarketOverview = MarketOverTopStocks<MostPerformingStocks> & {
  sp500Change: PriceChange;
  lastUpdate: string;
};

export type MarketOverviewResponse = MarketOverTopStocks<StockSummary> & {
  sp500Change: PriceChange;
  lastUpdate: string;
};
