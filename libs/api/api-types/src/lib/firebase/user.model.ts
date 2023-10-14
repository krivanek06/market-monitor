import { PortfolioTransaction } from './portfolio.model';
import { SymbolType } from './symbol.model';

export enum UserAccountType {
  TEST = 'TEST',
  ADMIN = 'ADMIN',
  DISABLES = 'DISABLED',
  ACCOUNT_TYPE_1 = 'ACCOUNT_TYPE_1',
}

export type UserData = {
  id: string;
  personal: UserPersonalInfo;
  groups: {
    groupMember: string[];
    groupOwner: string[];
    groupInvitations: string[];
    groupWatched: string[];
  };
  settings: UserSettings;
  accountResets: UserAccountResets[];
};

/**
 * user can reset its account and all previous data
 * such as groups, transactions, watchlist, etc. will be removed
 */
export type UserAccountResets = {
  date: string;
};

export type UserPortfolioTransaction = {
  startingCash: number;
  transactions: PortfolioTransaction[];
  // cashDeposit: PortfolioTransactionCash[];
};

export type UserWatchlist = {
  data: {
    symbol: string;
    symbolType: SymbolType;
  }[];
  createdDate: string;
};

export type UserPersonalInfo = {
  accountType: UserAccountType;
  photoURL: string | null;
  displayName: string | null;
};

export type UserSettings = {
  /**
   * if true, for each buy/sell transaction, the system will check and adjust the cash on hand
   * throw error if user doesn't have enough cash on hand on sell operation
   */
  isPortfolioCashActive: boolean;
  /**
   * if true, user will be able to create groups
   */
  isCreatingGroupAllowed: boolean;
  /**
   * if true, other users will be able to find this user portfolio by searching
   */
  isProfilePublic: boolean;
  /**
   * if true, user will be able to trade with historical assets,
   * selecting the date of the transaction in history.
   * If false user can buy/sell assets only for current date
   */
  isHistoricalAssetsTradingAllowed: boolean;
};
