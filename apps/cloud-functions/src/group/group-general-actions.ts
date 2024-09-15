import {
  GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR,
  GROUP_CLOSED,
  GROUP_IS_FULL_ERROR,
  GROUP_MEMBER_LIMIT,
  GROUP_NOT_FOUND_ERROR,
  GROUP_USER_ALREADY_MEMBER_ERROR,
  GROUP_USER_HAS_NO_INVITATION_ERROR,
  GROUP_USER_NOT_OWNER,
  GroupData,
  GroupGeneralActions,
  GroupMember,
  GroupMembersData,
  GROUPS_USER_ALREADY_INVITED_ERROR,
  USER_HAS_DEMO_ACCOUNT_ERROR,
  USER_INCORRECT_ACCOUNT_TYPE_ERROR,
  USER_NOT_FOUND_ERROR,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import { getCurrentDateDefaultFormat, transformUserToGroupMember } from '@mm/shared/general-util';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  groupCollectionMoreInformationRef,
  groupDocumentMembersRef,
  groupDocumentRef,
  userDocumentRef,
} from '../models';

export const groupGeneralActions = onCall(async (request) => {
  const userAuthId = request.auth?.uid as string;
  const data = request.data as GroupGeneralActions;

  const authUserData = (await userDocumentRef(userAuthId).get()).data();
  const groupData = (await groupDocumentRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if auth user exists
  if (!authUserData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // check user account type
  if (authUserData.userAccountType !== UserAccountEnum.DEMO_TRADING) {
    throw new HttpsError('aborted', USER_INCORRECT_ACCOUNT_TYPE_ERROR);
  }

  // demo account can not be added to the group
  if (authUserData.isDemo) {
    throw new HttpsError('aborted', USER_HAS_DEMO_ACCOUNT_ERROR);
  }

  if (data.type === 'inviteUsers') {
    return inviteUsers(authUserData, groupData, data.userIds);
  }

  if (data.type === 'inviteUserRemoveInvitation') {
    return inviteUserRemoveInvitation(authUserData, groupData, data.userId);
  }

  if (data.type === 'inviteUsersAccept') {
    return inviteUsersAccept(authUserData, groupData);
  }

  if (data.type === 'membersRemove') {
    return membersRemove(authUserData, groupData, data.userIds);
  }

  if (data.type === 'requestMembership') {
    return requestMembership(authUserData, groupData);
  }

  if (data.type === 'requestMembershipAccept') {
    return requestMembershipAccept(authUserData, groupData, data.userId);
  }

  if (data.type === 'requestMembershipDecline') {
    return requestMembershipDecline(authUserData, groupData, data.userId);
  }

  if (data.type === 'deleteGroup') {
    return deleteGroup(authUserData, groupData);
  }

  if (data.type === 'leaveGroup') {
    return leaveGroup(authUserData, groupData);
  }

  if (data.type === 'closeGroup') {
    return closeGroup(authUserData, groupData);
  }

  throw new HttpsError('invalid-argument', 'Invalid action type');
});

/** Invite a user to a group */
const inviteUsers = async (authUserData: UserData, groupData: GroupData, userIds: string[]) => {
  // check if owner
  if (groupData.ownerUserId !== authUserData.id) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // get user ids that are not already in group or invited or requested
  const usedUserIds = [
    groupData.ownerUserId,
    ...groupData.memberUserIds,
    ...groupData.memberRequestUserIds,
    ...groupData.memberInvitedUserIds,
  ];
  const filteredOutUserIds = userIds.filter((userId) => !usedUserIds.includes(userId));

  if (filteredOutUserIds.length === 0) {
    return 0;
  }

  // add users to invited list
  await groupDocumentRef(groupData.id).update({
    memberInvitedUserIds: [...groupData.memberInvitedUserIds, ...filteredOutUserIds],
  } satisfies Partial<GroupData>);

  // add group to user groupInvitations
  for await (const userId of filteredOutUserIds) {
    await userDocumentRef(userId).update({
      'groups.groupInvitations': FieldValue.arrayUnion(groupData.id),
    });
  }

  return filteredOutUserIds.length;
};

/** Remove a group invitation sent to the user by the owner or the user itself */
const inviteUserRemoveInvitation = async (authUserData: UserData, groupData: GroupData, userId: string) => {
  // check if requestor is owner or the user who leaves
  if (groupData.ownerUserId !== authUserData.id && userId !== authUserData.id) {
    throw new HttpsError('failed-precondition', GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR);
  }

  // group - remove user from invited list
  await groupDocumentRef(groupData.id).update({
    memberInvitedUserIds: FieldValue.arrayRemove(userId),
  });

  // user - remove group from groupInvitations
  await userDocumentRef(userId).update({
    'groups.groupInvitations': FieldValue.arrayRemove(groupData.id),
  });
};

/** Closing group - removing user data */
const closeGroup = async (authUserData: UserData, groupData: GroupData) => {
  // check if owner
  if (groupData.ownerUserId !== authUserData.id) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // update group
  await groupDocumentRef(groupData.id).update({
    isClosed: true,
    endDate: getCurrentDateDefaultFormat(),
    memberInvitedUserIds: [],
    memberRequestUserIds: [],
  } satisfies Partial<GroupData>);

  // remove from group all users who are invited or requested
  const userIds = [...groupData.memberInvitedUserIds, ...groupData.memberRequestUserIds];
  for await (const userId of userIds) {
    await userDocumentRef(userId).update({
      'groups.groupInvitations': FieldValue.arrayRemove(groupData.id),
      'groups.groupRequested': FieldValue.arrayRemove(groupData.id),
    });
  }
};

/** User accepts a group invitation */
const inviteUsersAccept = async (authUserData: UserData, groupData: GroupData) => {
  // check if user is already in group
  if (authUserData.groups.groupMember.includes(groupData.id)) {
    throw new HttpsError('already-exists', GROUP_USER_ALREADY_MEMBER_ERROR);
  }

  // check if user has an invitation
  if (!authUserData.groups.groupInvitations.includes(groupData.id)) {
    throw new HttpsError('failed-precondition', GROUP_USER_HAS_NO_INVITATION_ERROR);
  }

  // check if group will not have more than N members
  if (groupData.memberUserIds.length >= GROUP_MEMBER_LIMIT) {
    throw new HttpsError('resource-exhausted', GROUP_IS_FULL_ERROR);
  }

  // check if group is already closed
  if (groupData.isClosed) {
    throw new HttpsError('failed-precondition', GROUP_CLOSED);
  }

  // demo account can not be added to the group
  if (authUserData.isDemo) {
    throw new HttpsError('aborted', USER_HAS_DEMO_ACCOUNT_ERROR);
  }

  // check user account type
  if (authUserData.userAccountType !== UserAccountEnum.DEMO_TRADING) {
    throw new HttpsError('aborted', USER_INCORRECT_ACCOUNT_TYPE_ERROR);
  }

  // update user to join group
  await userDocumentRef(authUserData.id).update({
    'groups.groupInvitations': FieldValue.arrayRemove(groupData.id),
    'groups.groupMember': FieldValue.arrayUnion(groupData.id),
  });

  // update group
  await groupDocumentRef(groupData.id).update({
    memberUserIds: [...groupData.memberUserIds, authUserData.id], // add user to members
    memberInvitedUserIds: groupData.memberInvitedUserIds.filter((id) => id !== authUserData.id), // remove invitation
    numberOfMembers: groupData.memberUserIds.length + 1, // increment number of members
  } satisfies Partial<GroupData>);

  // update group members
  await groupDocumentMembersRef(groupData.id).update({
    data: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(authUserData, groupData.memberUserIds.length + 1),
    }),
  });
};

/** User can leave the group */
const leaveGroup = async (authUserData: UserData, groupData: GroupData) => {
  const groupMemberData = (await groupDocumentMembersRef(groupData.id).get()).data();

  // check if member data exists
  if (!groupMemberData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // remove user from group
  const updatedUsers = groupData.memberUserIds.filter((userId) => userId !== authUserData.id);
  await groupDocumentRef(groupData.id).update({
    memberUserIds: updatedUsers,
    numberOfMembers: updatedUsers.length,
  } satisfies Partial<GroupData>);

  // remove user from group member
  await groupDocumentMembersRef(groupData.id).update({
    data: groupMemberData.data.filter((user) => user.id !== authUserData.id),
  } satisfies Partial<GroupMembersData>);

  // update user info
  await userDocumentRef(authUserData.id).update({
    'groups.groupMember': FieldValue.arrayRemove(groupData.id),
  });
};

/** Remove a user from a group or user leaves the group */
const membersRemove = async (authUserData: UserData, groupData: GroupData, userIds: string[]) => {
  // check if authenticated user is owner or the user who leaves
  if (groupData.ownerUserId !== authUserData.id) {
    throw new HttpsError('aborted', GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR);
  }

  const groupMemberData = (await groupDocumentMembersRef(groupData.id).get()).data();

  // check if member data exists
  if (!groupMemberData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // remove user from group
  const updatedUsers = groupData.memberUserIds.filter((userId) => !userIds.includes(userId));
  await groupDocumentRef(groupData.id).update({
    memberUserIds: updatedUsers,
    numberOfMembers: updatedUsers.length, // increment number of members
  } satisfies Partial<GroupData>);

  // remove user from group member
  await groupDocumentMembersRef(groupData.id).update({
    data: groupMemberData.data.filter((user) => !userIds.includes(user.id)),
  } satisfies Partial<GroupMembersData>);

  // update user info
  for (const userId of userIds) {
    await userDocumentRef(userId).update({
      'groups.groupMember': FieldValue.arrayRemove(groupData.id),
    });
  }
};

/** User request membership to a group */
const requestMembership = async (authUserData: UserData, groupData: GroupData) => {
  // check if user is already in group
  if (groupData.memberUserIds.includes(authUserData.id)) {
    throw new HttpsError('already-exists', GROUP_USER_ALREADY_MEMBER_ERROR);
  }

  // check if user already requested to join
  if (groupData.memberRequestUserIds.includes(authUserData.id)) {
    throw new HttpsError('already-exists', GROUPS_USER_ALREADY_INVITED_ERROR);
  }

  // check if user already invited
  if (groupData.memberInvitedUserIds.includes(authUserData.id)) {
    throw new HttpsError('already-exists', GROUPS_USER_ALREADY_INVITED_ERROR);
  }

  // group update - add user to requested list
  await groupDocumentRef(groupData.id).update({
    memberRequestUserIds: [...groupData.memberRequestUserIds, authUserData.id],
  } satisfies Partial<GroupData>);

  // user update - add group to user groupRequested
  await userDocumentRef(authUserData.id).update({
    'groups.groupRequested': FieldValue.arrayUnion(groupData.id),
  });
};

/** Group accepts the user request to join */
const requestMembershipAccept = async (authUserData: UserData, groupData: GroupData, userId: string) => {
  const userData = (await userDocumentRef(userId).get()).data();

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // check if authenticated user is owner
  if (groupData.ownerUserId !== authUserData.id) {
    throw new HttpsError('aborted', GROUP_USER_NOT_OWNER);
  }

  // only allow DEMO_TRADING users to join
  if (userData.userAccountType !== UserAccountEnum.DEMO_TRADING || userData.isDemo) {
    throw new HttpsError('aborted', 'User account type is not allowed to join group');
  }

  // check if user sent request
  if (!groupData.memberRequestUserIds.includes(userData.id)) {
    throw new HttpsError('failed-precondition', GROUP_USER_HAS_NO_INVITATION_ERROR);
  }

  // check if group will not have more than N members
  if (groupData.memberUserIds.length >= GROUP_MEMBER_LIMIT) {
    throw new HttpsError('resource-exhausted', GROUP_IS_FULL_ERROR);
  }

  // update group
  await groupDocumentRef(groupData.id).update({
    memberUserIds: [...groupData.memberUserIds, userData.id],
    memberRequestUserIds: groupData.memberRequestUserIds.filter((id) => id !== userData.id),
    numberOfMembers: groupData.memberUserIds.length + 1,
  } satisfies Partial<GroupData>);

  // update group member data
  await groupDocumentMembersRef(groupData.id).update({
    data: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(userData, groupData.memberUserIds.length + 1),
    }),
  });

  // update user
  await userDocumentRef(userData.id).update({
    'groups.groupRequested': FieldValue.arrayRemove(groupData.id),
    'groups.groupMember': FieldValue.arrayUnion(groupData.id),
  });
};

/** Remove user who request to join the group - only owner or the requester can do it */
const requestMembershipDecline = async (authUserData: UserData, groupData: GroupData, userId: string) => {
  const userData = (await userDocumentRef(userId).get()).data();

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // check if authenticated user is owner or the user who leaves
  if (groupData.ownerUserId !== authUserData.id && userId !== authUserData.id) {
    throw new HttpsError('aborted', GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR);
  }

  // update group
  await groupDocumentRef(groupData.id).update({
    memberRequestUserIds: groupData.memberRequestUserIds.filter((id) => id !== userId),
  } satisfies Partial<GroupData>);

  // update user
  await userDocumentRef(userId).update({
    'groups.groupRequested': FieldValue.arrayRemove(groupData.id),
  });
};

/** Deleting group and all subcollection */
const deleteGroup = async (authUserData: UserData, groupData: GroupData) => {
  // check if owner match request user id
  if (groupData.ownerUserId !== authUserData.id) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // remove group from owner
  await userDocumentRef(authUserData.id).update({
    'groups.groupOwner': FieldValue.arrayRemove(groupData.id),
  });

  // remove group all users even if there is a bug, remove all data
  const userIds = [...groupData.memberUserIds, ...groupData.memberInvitedUserIds, ...groupData.memberRequestUserIds];
  for await (const userId of userIds) {
    await userDocumentRef(userId).update({
      'groups.groupInvitations': FieldValue.arrayRemove(groupData.id),
      'groups.groupMember': FieldValue.arrayRemove(groupData.id),
      'groups.groupRequested': FieldValue.arrayRemove(groupData.id),
    });
  }

  // delete every sub collection
  (await groupCollectionMoreInformationRef(groupData.id).listDocuments()).forEach((doc) => doc.delete());

  // delete group
  await groupDocumentRef(groupData.id).delete();

  // return removed group
  return groupData;
};
