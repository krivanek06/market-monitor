import { User } from 'firebase/auth';
import { DataDocsWrapper } from './../constants/generic.model';
import { PortfolioState, PortfolioStateHoldingBase, PortfolioTransaction } from './portfolio.model';
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
  features: UserFeatures;
  systemRank: UserSystemRank;
};

export type UserSystemRank = {
  /**
   * value calculate from portfolioState.totalGainsPercentage based on
   * all users in the system
   */
  portfolioTotalGainsPercentage?: UserSystemRankItem;
};

export type UserSystemRankItem = {
  rank: number;
  /**
   * previous rank, on first calculation it is null
   */
  rankPrevious: number | null;
  /**
   * difference between rank and rankPrevious, on first calculation it is null
   */
  rankChange?: number | null;
  /**
   * date when rank was calculated
   */
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
  photoURL: string | null;
  displayName: string;
  providerId: User['providerData'][0]['providerId'];
};

export type UserSettings = {
  /**
   * if true, user will be able to receive group invitations
   */
  allowReceivingGroupInvitations: boolean;

  // TODO: darkModeEnabled: boolean
};

export type UserFeatures = {
  /**
   * true if user is admin, grand access to all features
   */
  isAdmin?: boolean;
  /**
   * if true, user can access group page and create groups limited by - GROUP_OWNER_LIMIT
   */
  allowAccessGroups?: boolean;

  /**
   * if true, user can create unlimited number of groups
   */
  allowCreateUnlimitedGroups?: boolean;

  /**
   * if true, user will have a starting cash balance and system
   * will always check whether user has enough cash to buy
   */
  allowPortfolioCashAccount?: boolean;

  /**
   * if true, user can have unlimited number of symbols in portfolio, else it is limited - USER_HOLDINGS_SYMBOL_LIMIT
   */
  allowUnlimitedSymbolsInHoldings?: boolean;

  /**
   * if true, user can have unlimited number of symbols in watchList, else it is limited - USER_WATCHLIST_SYMBOL_LIMIT
   */
  allowUnlimitedSymbolsInWatchList?: boolean;

  /**
   * if true (by default true), user will participate in hall of fame
   */
  allowAccessHallOfFame?: boolean;
};
export type UserFeaturesType = keyof UserFeatures;

export enum UserAccountTypes {
  Trading = 'Trading',
  Basic = 'Basic',
}

export type UserResetTransactionsInput = {
  /**
   * user's id whom to to reset transactions
   */
  userId: string;
  /**
   * selected account type by the user
   */
  accountTypeSelected: UserAccountTypes;
};

export const accountDescription: { [K in UserAccountTypes]: string[] } = {
  [UserAccountTypes.Trading]: [
    `
    With trading account you start with a specific amount of cash on hand.
    You can buy and sell stocks, ETFs, and other securities until you run out of cash.
    Every transaction has some small fess included to it to simulate real life trading.`,
    `As a trader you can also join or create a group and compete with other traders.`,
    `Your profile is public, meaning that other users can find you and see your portfolio and
    as your trading progress is monitored, you will be part of a ranking system,`,
  ],
  [UserAccountTypes.Basic]: [
    `With basic account you start with a clean portfolio and you can add stocks, ETFs, and other securities to your portfolio.`,
    `This account is intended for users who wants to mirror their real life portfolio and track their progress.`,
    `You can buy assets in the past and the application will calculate your current portfolio value based on the historical data.
    Later we plan to add easier functionalities to mirror your trading portfolio such as uploading a CSV file with your transactions.`,
    `Your profile is private, no one can see your portfolio. You do not participate in any ranking system.`,
  ],
};
