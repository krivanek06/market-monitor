import { User } from 'firebase/auth';
import { DataDocsWrapper } from './../constants/generic.model';
import { PortfolioState, PortfolioStateHoldingBase, PortfolioTransaction } from './portfolio.model';
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
  ADMIN = 'ADMIN',
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
    `
    With trading account you start with a specific amount of cash on hand.
    You can buy and sell stocks, ETFs, and other securities until you run out of cash.
    Every transaction has some small fess included to it to simulate real life trading.`,
    `As a trader you can also join or create a group and compete with other traders.`,
    `Your profile is public, meaning that other users can find you and see your portfolio and
    as your trading progress is monitored, you will be part of a ranking system,`,
  ],
  [UserAccountEnum.NORMAL_BASIC]: [
    `With basic account you start with a clean portfolio and you can add stocks, ETFs, and other securities to your portfolio.`,
    `This account is intended for users who wants to mirror their real life portfolio and track their progress.`,
    `You can buy assets in the past and the application will calculate your current portfolio value based on the historical data.
    Later we plan to add easier functionalities to mirror your trading portfolio such as uploading a CSV file with your transactions.`,
    `Your profile is private, no one can see your portfolio. You do not participate in any ranking system.`,
  ],
  [UserAccountEnum.NORMAL_PAID]: [`TODO`],
  [UserAccountEnum.ADMIN]: [`TODO`],
};
