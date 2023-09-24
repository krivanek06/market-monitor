import { SymbolSummary } from './stock-data.model';

export type PortfolioHoldings = {
  symbol: string;
  symbolType: SymbolType;
  units: number;
  invested: number;
};

export type PortfolioHoldingsData = PortfolioHoldings & {
  // tech, finance, etc.
  sector: string;
  breakEvenPrice: number;
  symbolSummary: SymbolSummary;
};

export type Portfolio = {
  portfolioCash: number | null;
  numberOfExecutedBuyTransactions: number;
  numberOfExecutedSellTransactions: number;
  transactionFees: number | null;
};

export type PortfolioRisk = {
  alpha: number;
  beta: number;
  sharpe: number;
  volatilityMeanPrct: number;
  estimatedReturnPrct: number;
  estimatedReturnValue: number;
  annualVariancePrct: number;
  annualVolatilityPrct: number;
};

export type PortfolioGrowth = {
  invested: number;
  date: string;
  ownedAssets: number;
};

export type PortfolioTransaction = {
  userId: string;
  data: {
    itemId: string;
    symbolType: SymbolType;
    symbol: string;
    units: number;
    unitPrice: number;
    date: string;
    return: number | null;
    returnChange: number | null;
    transactionType: 'BUY' | 'SELL';
  }[];
};

export type SymbolType = 'STOCK' | 'CRYPTO' | 'ETF' | 'FUND' | 'CURRENCY';
