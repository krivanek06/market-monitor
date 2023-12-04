import { DataDocsWrapper } from '../constants';
import {
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioTransaction,
  PortfolioTransactionMore,
} from './portfolio.model';
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

export type GroupData = {
  id: string;
  name: string;
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
  endDate?: string;

  /**
   * Fields with user ids
   */
  ownerUserId: string;
  ownerUser: UserBase;

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
   * portfolio state calculated from transactions at the end of the day
   */
  portfolioState: PortfolioState;
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
  /**
   * data about current holdings, calculated from users data
   */
  groupHoldingSnapshotsData: PortfolioStateHolding[];
};
