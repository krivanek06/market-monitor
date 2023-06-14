import {
  MostPerformingStocks,
  StockPriceChange,
} from './financial-modeling-starter.model';
import { StockSummary } from './firebase-stock-data.model';

export type MarketOverview = {
  sp500Change: StockPriceChange;
  lastUpdate: string;
  stockTopGainers: MostPerformingStocks[];
  stockTopLosers: MostPerformingStocks[];
  stockTopActive: MostPerformingStocks[];
};

export type MarketOverviewResponse = {
  sp500Change: StockPriceChange;
  lastUpdate: string;
  stockTopGainers: StockSummary[];
  stockTopLosers: StockSummary[];
  stockTopActive: StockSummary[];
};
