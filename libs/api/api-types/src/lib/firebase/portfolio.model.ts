import { SymbolSummary, SymbolType } from './symbol.model';

export type PortfolioRisk = {
  /**
   * excess return compared to SP500, by how much % did user beat the market
   * so if user has 10% return and SP500 has 5% return, excess return is 5% and alpha is 5
   */
  alpha: number;
  beta: number;
  sharpe: number;
  volatility: number;
  calculationDate: string;
  // estimatedReturnPrct: number;
  // estimatedReturnValue: number;
  // annualVariancePrct: number;
  // annualVolatilityPrct: number;
};

export type PortfolioState = {
  /**
   * balance = invested + cashOnHand
   */
  balance: number;
  /**
   * holdingsBalance = closed price * units for each holdings
   * calculated from holdings the value of user's appreciated investments
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
  date: string;
  /**
   * change in balance from previousBalanceDate
   */
  previousBalanceChange: number;
  /**
   * change in balance from previousBalanceDate in percentage
   */
  previousBalanceChangePercentage: number;
  /**
   * date when user portfolio was reset
   */
  accountResetDate: string;
  /**
   * risk of the portfolio
   */
  portfolioRisk?: PortfolioRisk | null;
};

export type PortfolioStateHoldingBase = {
  symbolType: SymbolType;
  symbol: string;
  units: number;
  /**
   * how much user invested. Used to calculate BEP.
   */
  invested: number;
};

export type PortfolioStateHolding = PortfolioStateHoldingBase & {
  breakEvenPrice: number; // calculated
  weight: number; // calculated
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

export type PortfolioTransactionMore = PortfolioTransaction & {
  userPhotoURL?: string | null;
  userDisplayName?: string;
};

export type PortfolioTransactionCash = {
  transactionId: string;
  date: string;
  amount: number;
};

export type PortfolioTransactionCreate = {
  symbol: string;
  symbolType: SymbolType;
  units: number;
  date: string;
  transactionType: PortfolioTransactionType;
  /** User can add custom total value of this holding and not load from API */
  customTotalValue?: number;
};
