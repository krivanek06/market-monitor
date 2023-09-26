import { PortfolioTransaction, SymbolType } from './portfolio.model';

export type UserAuthenticationType =
  | {
      authenticationType: 'GOOGLE';
      token: string;
    }
  | {
      authenticationType: 'BASIC_AUTH';
      password: string;
    };

export enum UserAccountType {
  TEST = 'TEST',
  ADMIN = 'ADMIN',
  DISABLES = 'DISABLED',
  ACCOUNT_TYPE_1 = 'ACCOUNT_TYPE_1',
}

export type User = {
  id: string;
  personal: UserPersonalInfo;
  groups: {
    groupMember: string[];
    groupOwner: string[];
    groupInvitations: string[];
    groupWatched: string[];
  };
  settings: UserSettings;
  lastSearchedSymbols: {
    symbolType: SymbolType;
    symbol: string;
  }[];
  favoriteSymbols: {
    symbolType: SymbolType;
    symbol: string;
  }[];
};

export type UserPortfolioTransaction = {
  transactions: PortfolioTransaction[];
  cashDeposit: {
    date: string;
    amount: number;
  }[];
};

export type UserPersonalInfo = {
  authentication: UserAuthenticationType;
  accountType: UserAccountType;
  accountCreated: string;
  lastSignIn: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
  isVerified: boolean;
};

export type UserSettings = {
  /**
   * if true, for each buy/sell transaction, the system will check and adjust the cash on hand
   * throw error if user doesn't have enough cash on hand on sell operation
   */
  isPortfolioCashActive: boolean;
  /**
   * if true, for each transaction the system will calculate the transaction fees
   */
  isTransactionFeesActive: boolean;
  /**
   * if true, user will be able to create groups
   */
  isCreatingGroupAllowed: boolean;
  /**
   * if true, other users will be able to find this user portfolio by searching
   */
  isProfilePublic: boolean;
};
