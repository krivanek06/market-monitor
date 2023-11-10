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
  role: USER_ROLE;
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

export enum USER_ROLE {
  SIMULATION = 'SIMULATION',
  BASIC = 'BASIC',
  ADMIN = 'ADMIN',
}

export type UserSettings = {
  /**
   * if true, other users will be able to find this user portfolio by searching
   */
  isProfilePublic: boolean;
};
