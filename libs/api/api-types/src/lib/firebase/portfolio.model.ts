import { SymbolQuote } from '../external-api';
import { SymbolType } from './symbol.model';

export type PortfolioRisk = {
  /**
   * excess return compared to SP500, by how much % did user beat the market
   * so if user has 10% return and SP500 has 5% return, excess return is 5% and alpha is 5
   */
  alpha: number;
  beta: number;
  sharpe: number;
  volatility: number;

  /**
   * date when it was last calculated
   */
  date: string;
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
   * closed price * units for each holdings - current value of holdings
   */
  holdingsBalance: number;

  /**
   * user's total invested value into holdings
   */
  invested: number;
  cashOnHand: number;
  startingCash: number;
  numberOfExecutedBuyTransactions: number;
  numberOfExecutedSellTransactions: number;
  transactionFees: number;

  /**
   * calculated based on SELL transactions
   * note: transaction fees are excluded
   */
  transactionProfit: number;

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
};

export type PortfolioStateExecution = Pick<
  PortfolioState,
  'numberOfExecutedBuyTransactions' | 'numberOfExecutedSellTransactions' | 'transactionFees' | 'date'
>;

export type SymbolStoreBase = {
  symbolType: SymbolType;
  symbol: string;
  sector: 'CRYPTO' | 'STOCK' | ({} & string);
};

export type PortfolioStateHoldingBase = SymbolStoreBase & {
  units: number;
  /**
   * how much user invested. Used to calculate BEP.
   */
  invested: number;
  breakEvenPrice: number;

  /**
   * list of user ids that have this holding,
   * optional, if not set then it is assumed that only owner has this holding
   */
  userIds?: string[];
};

export type PortfolioStateHolding = PortfolioStateHoldingBase & {
  weight: number; // calculated
  symbolQuote: SymbolQuote;
};

export type PortfolioStateHoldings = PortfolioState & {
  /**
   * calculated from previous transactions
   */
  holdings: PortfolioStateHolding[];
};

export type PortfolioGrowthAssets = {
  symbol: string;
  /**
   * modifies symbol string a bit, example for crypto it removes USD from BTCUSD -> BTC
   */
  displaySymbol: string;
  data: PortfolioGrowthAssetsDataItem[];
};

export type PortfolioGrowthAssetsDataItem = {
  date: string;
  /**
   * units * invested values - in total how much user invested in this asset
   */
  investedTotal: number;
  /**
   * units of the asset user has in this specific date
   */
  units: number;
  /**
   * units * price of the asset on day
   */
  marketTotal: number;
  /**
   * units * price of the asset on day - invested values
   */
  profit: number;
  /**
   * when transaction is SELL, this is the return from the transaction
   */
  accumulatedReturn: number;
};

export type PortfolioGrowth = Pick<PortfolioGrowthAssetsDataItem, 'investedTotal' | 'marketTotal'> & {
  date: string;

  /**
   * if user has activated cash account it will be investedValue + cashOnHand else investedValue
   */
  balanceTotal: number;
};

export type PortfolioTransactionType = 'BUY' | 'SELL' | 'SHORT';

export type PortfolioTransaction = SymbolStoreBase & {
  transactionId: string;
  userId: string;
  units: number;
  unitPrice: number;
  returnValue: number;
  transactionType: PortfolioTransactionType;
  transactionFees: number;

  /**
   * what was the return % from the SELL transaction
   * example: if user bought for 100 and sold for 110, returnChange is 10
   * example: value 11.05 is 11.05%
   */
  returnChange: number;

  /**
   * date to which to associate this transaction (if weekend then last trading date)
   */
  date: string;
  /**
   * date when transaction was executed (if weekend , stays weekend), used for sorting - [yyyy-MM-dd HH:mm:ss]
   */
  dateExecuted: string;
  /**
   * differs from date, that date is when used created transaction, but it can be
   * during weekend and market is closed during weekend, so this will be last open market date
   */
  priceFromDate?: string;

  /**
   * if exchange is CRYPTO, it removes the 'USD' part so BTCUSD becomes BTC
   * this field is only available on the client side, it's computed in cloudflare
   */
  displaySymbol?: string;
};

export type PortfolioTransactionMore = PortfolioTransaction & {
  userPhotoURL?: string | null;
  userDisplayName?: string;
  userDisplayNameInitials?: string;
};

export type PortfolioTransactionCash = {
  transactionId: string;
  date: string;
  amount: number;
};
