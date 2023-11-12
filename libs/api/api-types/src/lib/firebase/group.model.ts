export type GroupData = {
  id: string;
  name: string;
  imageUrl: string;

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
   * user ids that requested to join
   */
  memberRequestUserIds: string[];
};
