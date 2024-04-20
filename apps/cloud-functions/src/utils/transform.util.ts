import { GroupBase, GroupData, GroupMember, UserBase, UserData } from '@mm/api-types';
import { getCurrentDateDefaultFormat } from '@mm/shared/general-util';

export const transformUserToBase = (user: UserData): UserBase => {
  return {
    id: user.id,
    accountCreatedDate: user.accountCreatedDate,
    portfolioState: user.portfolioState,
    personal: user.personal,
    isAccountActive: user.isAccountActive,
    isDemo: user.isDemo,
    userAccountType: user.userAccountType,
  };
};

export const transformGroupToBase = (group: GroupData): GroupBase => {
  return {
    id: group.id,
    name: group.name,
    ownerUserId: group.ownerUserId,
    isClosed: group.isClosed,
    createdDate: group.createdDate,
    endDate: group.endDate,
    imageUrl: group.imageUrl,
    isPublic: group.isPublic,
    ownerUser: group.ownerUser,
    portfolioState: group.portfolioState,
    numberOfMembers: group.numberOfMembers,
    nameLowerCase: group.nameLowerCase,
  };
};

export const transformUserToGroupMember = (
  user: UserData,
  newPosition: number,
  userPreviousGroupData?: GroupMember,
): GroupMember => {
  return {
    ...transformUserToBase(user),
    since: getCurrentDateDefaultFormat(),
    position: {
      currentGroupMemberPosition: newPosition,
      previousGroupMemberPosition: userPreviousGroupData?.position?.currentGroupMemberPosition ?? null,
    },
  };
};
