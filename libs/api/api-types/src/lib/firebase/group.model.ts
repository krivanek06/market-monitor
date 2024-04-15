import { DataDocsWrapper } from '../constants';
import {
  PortfolioState,
  PortfolioStateHoldingBase,
  PortfolioTransaction,
  PortfolioTransactionMore,
} from './portfolio.model';
import { RankingItem } from './ranking.model';
import { UserBase, UserData } from './user.model';

export type GroupCreateInput = {
  groupName: string;
  isPublic: boolean;
  isOwnerMember: boolean;
  memberInvitedUserIds: string[];
  imageUrl: string | null;
};

export type GroupBaseInput = {
  groupId: string;
  userId: string;
};

export type GroupBaseInputInviteMembers = {
  groupId: string;
  userIds: string[];
};

export type GroupSettingsChangeInput = {
  groupId: string;
  isPublic: boolean;
  groupName: string;
  imageUrl: string | null;
  /**
   * user ids that are removed from the group
   */
  removingUserIds: string[];
};

export type GroupMember = UserBase & {
  /**
   * date when user joined the group
   */
  since: string;

  position: {
    /**
     * position in the group based on portfolioState
     */
    currentGroupMemberPosition: number;

    /**
     * position in the group based on portfolioState previous date,
     * valued that was saved in currentGroupMemberPosition
     */
    previousGroupMemberPosition: number | null;
  };
};

export type UserGroupData = { [K in keyof UserData['groups']]: GroupData[] };

export type GroupBase = {
  id: string;
  name: string;
  nameLowerCase: string;
  imageUrl: string | null;

  /**
   * if true, people can find it and possible to request joining
   */
  isPublic: boolean;

  /**
   * set to true when endDate is added
   */
  isClosed: boolean;

  /**
   * how long to keep group open
   */
  createdDate: string;
  endDate: string | null;

  /**
   * Fields with user ids
   */
  ownerUserId: string;
  ownerUser: UserBase;
  /**
   * portfolio state calculated from transactions at the end of the day
   */
  portfolioState: PortfolioState;

  /**
   * number of members (memberUserIds.length)
   */
  numberOfMembers: number;

  /**
   * if true, group is created for demo purposes
   */
  isDemo?: boolean;
};

export type GroupData = GroupBase & {
  /**
   * user ids that are members
   */
  memberUserIds: string[];
  /**
   * user ids that are invited
   */
  memberInvitedUserIds: string[];
  /**
   * user ids that requested to join the group
   */
  memberRequestUserIds: string[];

  /**
   * data when was members and transactions last updated
   */
  modifiedSubCollectionDate: string;

  /**
   * some ranking data for the group
   */
  systemRank: SystemRankGroup;
};

export type SystemRankGroup = {
  /**
   * value calculate from portfolioState.totalGainsPercentage based on
   * all users in the system
   */
  portfolioTotalGainsPercentage?: RankingItem;
};

export type GroupTransactionsData = DataDocsWrapper<PortfolioTransaction>;
export type GroupMembersData = DataDocsWrapper<GroupMember>;
export type GroupPortfolioStateSnapshotsData = DataDocsWrapper<PortfolioState>;
export type GroupHoldingSnapshotsData = DataDocsWrapper<PortfolioStateHoldingBase>;

export type GroupDetails = {
  groupData: GroupData;
  groupTransactionsData: PortfolioTransactionMore[];
  groupMembersData: GroupMember[];
  groupPortfolioSnapshotsData: PortfolioState[];
};
