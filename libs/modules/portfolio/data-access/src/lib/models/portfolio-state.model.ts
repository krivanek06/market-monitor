import { PortfolioGrowthAssetsDataItem, SymbolSummary, SymbolType } from '@market-monitor/api-types';

export type PortfolioState = {
  balance: number;
  invested: number;
  numberOfExecutedBuyTransactions: number;
  numberOfExecutedSellTransactions: number;
  transactionFees: number;
  cashOnHand: number;
  holdings: PortfolioStateHolding[];
  totalGainsValue: number;
  totalGainsPercentage: number;
};

export type PortfolioStateHolding = {
  symbolType: SymbolType;
  symbol: string;
  units: number;
  invested: number;
  sector: string; // tech, finance, etc.
  // breakEvenPrice: number; // calculated
  symbolSummary: SymbolSummary;
};

export type PortfolioGrowth = Pick<PortfolioGrowthAssetsDataItem, 'investedValue' | 'marketTotalValue'> & {
  date: string;
  ownedAssets: number;
};
