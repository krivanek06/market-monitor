import { PortfolioGrowthAssetsDataItem, PortfolioState } from '@market-monitor/api-types';

export type PortfolioTransactionToDate = Pick<
  PortfolioState,
  'numberOfExecutedBuyTransactions' | 'numberOfExecutedSellTransactions' | 'transactionFees' | 'date'
>;

export type PortfolioGrowth = Pick<PortfolioGrowthAssetsDataItem, 'investedValue' | 'marketTotalValue'> & {
  date: string;

  /**
   * if user has activated cash account it will be investedValue + cashOnHand else investedValue
   */
  totalBalanceValue: number;
};
