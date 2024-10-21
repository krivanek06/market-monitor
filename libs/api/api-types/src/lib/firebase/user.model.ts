import { User } from 'firebase/auth';
import { DataDocsWrapper } from '../constants';
import {
  PortfolioGrowth,
  PortfolioRisk,
  PortfolioState,
  PortfolioStateHoldingBase,
  PortfolioTransaction,
  SymbolStoreBase,
} from './portfolio.model';
import { RankingItem } from './ranking.model';

/**
 * minimal base user information required for any operation
 */
export type UserBaseMin = {
  id: string;
  personal: UserPersonalInfo;
};

/**
 * extended user information, mainly used throughout the dashboard
 */
export type UserBase = UserBaseMin & {
  /**
   * user portfolio state calculated from transactions in cloud functions at the end of the day
   */
  portfolioState: PortfolioState;

  accountCreatedDate: string;

  /**
   * at each login is set to true, set to false
   * only if lastLoginDate is more than USER_LOGIN_ACCOUNT_ACTIVE_DAYS ago
   */
  isAccountActive: boolean;

  /**
   * if true, account was created by the system for demo purposes
   */
  isDemo: boolean;

  /**
   * if true, account was created by the system for testing purposes
   */
  isTest?: boolean;

  /**
   * features that user has access to
   */
  userAccountType: UserAccountEnum;
};

export type UserData = UserBase & {
  dates: {
    /**
     * when was portfolio growth data last updated
     */
    portfolioGrowthDate: string;
  };
  groups: {
    /**
     * group member
     */
    groupMember: string[];
    /**
     * group owner
     */
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
  /**
   * data about current holdings, calculated from previous transactions
   */
  holdingSnapshot: DataDocsWrapper<PortfolioStateHoldingBase>;
  /**
   * only available for DEMO_TRADING users
   */
  systemRank?: SystemRankUser;
  /**
   * risk of the portfolio
   */
  portfolioRisk?: PortfolioRisk | null;
  /**
   * additional private info about the user
   */
  userPrivateInfo: UserPrivateInfo;
};

export type UserDataDemoData = {
  userData: UserData;
  password: string;
};

export type UserCreateDemoAccountInput = {
  accountType: UserAccountBasicTypes;
  publicIP?: string;
};

export type SystemRankUser = {
  /**
   * value calculate from portfolioState.totalGainsPercentage based on
   * all users in the system
   */
  portfolioTotalGainsPercentage?: RankingItem;
};

export type UserPortfolioTransaction = {
  transactions: PortfolioTransaction[];
};

export type UserWatchList = {
  data: SymbolStoreBase[];
  createdDate: string;
};

export type UserPrivateInfo = {
  /**
   * user's public IP
   */
  publicIP: string | null;
};

export type UserPersonalInfo = {
  photoURL: string | null;
  displayName: string;
  displayNameLowercase: string;
  displayNameInitials: string;
  providerId: User['providerData'][0]['providerId'];
  email: string;
};

/**
 * settings which can be toggled by the user
 */
export type UserSettings = {
  isDarkMode?: boolean;
};

export enum UserAccountEnum {
  DEMO_TRADING = 'DEMO_TRADING',
  NORMAL_BASIC = 'NORMAL_BASIC',
  NORMAL_PAID = 'NORMAL_PAID',
}

export type UserAccountTypes = keyof typeof UserAccountEnum;

/**
 * picked account types user can choose from by default, others can added by the system
 */
export type UserAccountBasicTypes = UserAccountEnum.NORMAL_BASIC | UserAccountEnum.DEMO_TRADING;

export const accountDescription: { [K in UserAccountEnum]: string[] } = {
  [UserAccountEnum.DEMO_TRADING]: [
    `Account type intended for users who wants to learn how to trade and practice trading.`,
    `You start with a specific amount of cash, your profile is public, you can search other users, you participate in a ranking system and you can join groups.`,
  ],
  [UserAccountEnum.NORMAL_BASIC]: [
    `Account type intended for users who wants to mirror their real life portfolio and track their progress.`,
    `Your profile is private, no one can see your portfolio. You do not participate in any ranking system.`,
  ],
  [UserAccountEnum.NORMAL_PAID]: [`TODO`],
};

export type UserPortfolioGrowthData = DataDocsWrapper<PortfolioGrowth>;
