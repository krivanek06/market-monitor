export type GroupData = {
  id: string;
  name: string;
  imageUrl: string;
  isClosed: boolean;

  /**
   * how long to keep group open
   */
  createdDate: string;
  endDate?: string;

  /**
   * Fields with user ids
   */
  members: string[];
  membersInvited: string[];
  owner: string;
};
