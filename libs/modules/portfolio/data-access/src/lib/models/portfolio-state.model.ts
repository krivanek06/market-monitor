import { PortfolioGrowthAssetsDataItem, SymbolSummary, SymbolType } from '@market-monitor/api-types';

export type PortfolioState = {
  /**
   * userBalance = invested + cashOnHand
   */
  userBalance: number;
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
   * calculated from previous transactions
   */
  holdings: PortfolioStateHolding[];

  /**
   * calculated from holdings and userBalance
   */
  totalGainsValue: number;
  totalGainsPercentage: number;

  firstTransactionDate: string;
  lastTransactionDate: string;
};

export type PortfolioTransactionToDate = Pick<
  PortfolioState,
  'numberOfExecutedBuyTransactions' | 'numberOfExecutedSellTransactions' | 'transactionFees'
> & {
  date: string;
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

export type PortfolioGrowth = Pick<PortfolioGrowthAssetsDataItem, 'investedValue' | 'marketTotalValue'> & {
  date: string;
  ownedAssets: number;

  /**
   * if user has activated cash account it will be investedValue + cashOnHand else investedValue
   */
  totalBalanceValue: number;
};
