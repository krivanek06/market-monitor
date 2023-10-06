import { PortfolioTransactionType, SymbolType } from '@market-monitor/api-types';

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
