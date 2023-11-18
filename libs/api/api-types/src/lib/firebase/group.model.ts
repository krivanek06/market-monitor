import { PortfolioState, PortfolioTransaction } from './portfolio.model';
import { UserBase, UserData } from './user.model';

export const GROUP_MEMBER_LIMIT = 50;
export const GROUP_OWNER_LIMIT = 3;

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

export type GroupMember = UserBase & {
  since: string;
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
  lastModifiedSubCollectionDate: string;

  /**
   * portfolio state calculated from transactions at the end of the day
   */
  lastPortfolioState: PortfolioState;
};

export type GroupTransactionsData = {
  lastModifiedDate: string;

  // memberInvitedUsers: UserBase[];
  // memberRequestUsers: UserBase[];
  lastTransactions: PortfolioTransaction[];
  // topTransaction: PortfolioTransaction[];
};

export type GroupMembersData = {
  lastModifiedDate: string;
  memberUsers: GroupMember[];
};
