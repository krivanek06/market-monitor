import { PortfolioGrowthAssetsDataItem } from '@mm/api-types';

export type PortfolioGrowth = Pick<PortfolioGrowthAssetsDataItem, 'breakEvenValue' | 'marketTotalValue'> & {
  date: string;

  /**
   * if user has activated cash account it will be investedValue + cashOnHand else investedValue
   */
  totalBalanceValue: number;

  /**
   * starting cash of the user, mainly used for groups to calculate threshold as users can join and leave
   */
  startingCash: number;
};
