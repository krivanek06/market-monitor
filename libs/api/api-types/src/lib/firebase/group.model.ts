export type GroupData = {
  id: string;
  name: string;
  imageUrl: string;

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
  memberUserIds: string[];
  memberInvitedUserIds: string[];
  ownerUserId: string;
};
