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

export type PortfolioGrowthAssets = {
  symbol: string;
  data: PortfolioGrowthAssetsDataItem[];
};

export type PortfolioGrowthAssetsDataItem = {
  date: string;
  price: number;
  units: number;
  totalValue: number;
};

export type PortfolioTransactionType = 'BUY' | 'SELL';

export type PortfolioTransaction = {
  transactionId: string;
  userId: string;
  userPhotoURL: string;
  userDisplayName: string;
  symbolType: SymbolType;
  symbol: string;
  units: number;
  unitPrice: number;
  date: string;
  returnValue: number;
  returnChange: number;
  transactionType: PortfolioTransactionType;
  transactionFees: number;
  // calculations
  // invested = unitPrice * units
};

export type PortfolioTransactionCash = {
  transactionId: string;
  date: string;
  amount: number;
};

export type PortfolioTransactionCreate = {
  userId: string;
  symbol: string;
  symbolType: SymbolType;
  units: number;
  date: string;
  transactionType: PortfolioTransactionType;
  /** User can add custom total value of this holding and not load from API */
  customTotalValue?: number;
};

export type PortfolioTransactionDelete = {
  userId: string;
  transactionId: string;
};

export type SymbolType = 'STOCK' | 'CRYPTO' | 'ETF' | 'FUND' | 'CURRENCY';
