import { Portfolio, PortfolioHoldings, SymbolType } from './portfolio.model';

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
  holdings: PortfolioHoldings[];
  groups: UserGroups;
  settings: UserSettings;
  portfolio: Portfolio;
  lastSearchedSymbols: {
    symbolType: SymbolType;
    symbol: string;
  }[];
  favoriteSymbols: {
    symbolType: SymbolType;
    symbol: string;
  }[];
};

export type UserGroups = {
  groupMember: string[];
  groupOwner: string[];
  groupInvitations: string[];
  groupWatched: string[];
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
  isPortfolioCashActive: boolean;
  isCreatingGroupAllowed: boolean;
  isProfilePublic: boolean;
};
