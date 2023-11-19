import { PortfolioState, PortfolioTransaction } from './portfolio.model';
import { SymbolType } from './symbol.model';

export type UserBase = {
  id: string;
  personal: UserPersonalInfo;

  /**
   * user portfolio state calculated from transactions in cloud functions at the end of the day
   */
  portfolioState: PortfolioState;

  accountCreatedDate: string;
};

export type UserData = UserBase & {
  groups: {
    groupMember: string[];
    groupOwner: string[];
    /**
     * invitation from a group to join
     */
    groupInvitations: string[];
    /**
     * user request to join a group
     */
    groupRequested: string[];
    groupWatched: string[];
  };
  settings: UserSettings;
  accountResets: UserAccountResets[];

  /**
   * dates
   */
  lastLoginDate: string;
};

/**
 * user can reset its account and all previous data
 * such as groups, transactions, watchlist, etc. will be removed
 */
export type UserAccountResets = {
  date: string;
};

export type UserPortfolioTransaction = {
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
  accountType: USER_ACCOUNT_TYPE;
  photoURL: string | null;
  displayName: string;
};

export enum USER_ACCOUNT_TYPE {
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
