import { User } from 'firebase/auth';
import { DataDocsWrapper } from './../constants/generic.model';
import { PortfolioRisk, PortfolioState, PortfolioStateHoldingBase, PortfolioTransaction } from './portfolio.model';
import { RankingItem } from './ranking.model';
import { SymbolType } from './symbol.model';

export type UserBase = {
  id: string;
  personal: UserPersonalInfo;

  /**
   * user portfolio state calculated from transactions in cloud functions at the end of the day
   */
  portfolioState: PortfolioState;

  accountCreatedDate: string;

  lastLoginDate: string;
  /**
   * at each login is set to true, set to false
   * only if lastLoginDate is more than USER_LOGIN_ACCOUNT_ACTIVE_DAYS ago
   */
  isAccountActive: boolean;
  /**
   * if true, account was created by the system for demo purposes
   */
  isDemo?: boolean;
};

export type UserData = UserBase & {
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
   * features that user has access to
   */
  userAccountType: UserAccountEnum;
  /**
   * only available for DEMO_TRADING users
   */
  systemRank?: SystemRankUser;
  /**
   * risk of the portfolio
   */
  portfolioRisk?: PortfolioRisk | null;
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
  data: {
    symbol: string;
    symbolType: SymbolType;
  }[];
  createdDate: string;
};

export type UserPersonalInfo = {
  photoURL: string | null;
  displayName: string;
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

export type UserResetTransactionsInput = {
  /**
   * user's id whom to to reset transactions
   */
  userId: string;
  /**
   * selected account type by the user
   */
  accountTypeSelected: UserAccountBasicTypes;
};

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
