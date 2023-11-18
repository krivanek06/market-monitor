import { PortfolioGrowthAssetsDataItem, PortfolioStateHoldings } from '@market-monitor/api-types';

export type PortfolioTransactionToDate = Pick<
  PortfolioStateHoldings,
  'numberOfExecutedBuyTransactions' | 'numberOfExecutedSellTransactions' | 'transactionFees'
> & {
  date: string;
};

export type PortfolioGrowth = Pick<PortfolioGrowthAssetsDataItem, 'investedValue' | 'marketTotalValue'> & {
  date: string;
  ownedAssets: number;

  /**
   * if user has activated cash account it will be investedValue + cashOnHand else investedValue
   */
  totalBalanceValue: number;
};
