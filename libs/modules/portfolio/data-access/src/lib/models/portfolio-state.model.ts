import { PortfolioHoldings, StockSummary } from '@market-monitor/api-types';

export type PortfolioState = {
  balance: number;
  invested: number;
  cashOnHand: number | null;
  totalGainsValue: number;
  totalGainsPercentage: number;
};

export type PortfolioHoldingsData = PortfolioHoldings & {
  // tech, finance, etc.
  sector: string;
  breakEvenPrice: number;
  assetSummary: StockSummary;
};
