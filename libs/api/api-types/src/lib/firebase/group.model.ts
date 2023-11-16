import { PortfolioTransaction } from './portfolio.model';
import { UserBase } from './user.model';

export const GROUP_MEMBER_LIMIT = 50;
export const GROUP_OWNER_LIMIT = 3;

export type GroupCreateInput = {
  groupName: string;
  isPublic: boolean;
  isOwnerMember: boolean;
  memberInvitedUserIds: string[];
  imageUrl: string | null;
};

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
};

export type GroupDetailsData = {
  lastModifiedDate: string;
  memberUsers: UserBase[];
  ownerUser: UserBase;
  memberInvitedUsers: UserBase[];
  memberRequestUsers: UserBase[];
  lastTransactions: PortfolioTransaction[];
  // topTransaction: PortfolioTransaction[]; // TODO implement
};
