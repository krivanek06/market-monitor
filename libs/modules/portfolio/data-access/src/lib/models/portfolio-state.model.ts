import { PortfolioGrowthAssetsDataItem, PortfolioState, SymbolSummary, SymbolType } from '@market-monitor/api-types';

export type PortfolioStateHoldings = PortfolioState & {
  /**
   * calculated from previous transactions
   */
  holdings: PortfolioStateHolding[];
};

export type PortfolioTransactionToDate = Pick<
  PortfolioStateHoldings,
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
