import { SymbolSummary, SymbolType } from './symbol.model';

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

export type PortfolioState = {
  /**
   * balance = invested + cashOnHand
   */
  balance: number;
  /**
   * holdingsBalance = closed price * units for each holdings
   */
  holdingsBalance: number;

  /**
   * total invested value into holdings
   */
  invested: number;
  cashOnHand: number;
  startingCash: number;
  numberOfExecutedBuyTransactions: number;
  numberOfExecutedSellTransactions: number;
  transactionFees: number;

  /**
   * calculated from holdings and balance
   */
  totalGainsValue: number;
  totalGainsPercentage: number;

  firstTransactionDate: string | null;
  lastTransactionDate: string | null;

  /**
   * date when it was last calculated
   */
  modifiedDate: string;

  /**
   * data about current holdings, calculated from previous transactions
   */
  holdingsPartial: PortfolioStateHoldingPartial[];
};

export type PortfolioStateHoldingPartial = {
  symbolType: SymbolType;
  symbol: string;
  units: number;
  /**
   * how much user invested. Used to calculate BEP.
   */
  invested: number;
};

export type PortfolioStateHolding = PortfolioStateHoldingPartial & {
  breakEvenPrice: number; // calculated
  symbolSummary: SymbolSummary;
};

export type PortfolioStateHoldings = PortfolioState & {
  /**
   * calculated from previous transactions
   */
  holdings: PortfolioStateHolding[];
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
