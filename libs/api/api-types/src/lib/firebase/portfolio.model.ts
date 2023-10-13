import { SymbolType } from './symbol.model';

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

export type PortfolioGrowthAssets = {
  symbol: string;
  data: PortfolioGrowthAssetsDataItem[];
};

export type PortfolioGrowthAssetsDataItem = {
  date: string;
  /**
   * units * invested values - how much user invested in this asset
   */
  investedValue: number;
  // breakEvenPrice - investedValue / units
  units: number;
  /**
   * units * price of the asset on day
   */
  marketTotalValue: number;
  // price - marketTotalValue / units
};

export type PortfolioTransactionType = 'BUY' | 'SELL';

export type PortfolioTransaction = {
  transactionId: string;
  userId: string;
  symbolType: SymbolType;
  symbol: string;
  units: number;
  unitPrice: number;
  date: string;
  returnValue: number;
  returnChange: number;
  transactionType: PortfolioTransactionType;
  transactionFees: number;
};

export type PortfolioTransactionAggregation = PortfolioTransaction & {
  userPhotoURL: string;
  userDisplayName: string;
};

export type PortfolioTransactionCash = {
  transactionId: string;
  date: string;
  amount: number;
};
