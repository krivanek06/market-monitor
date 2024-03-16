import { GROUP_MEMBER_LIMIT, GroupMember, UserAccountEnum } from '@mm/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  GROUP_IS_FULL_ERROR,
  GROUP_NOT_FOUND_ERROR,
  GROUP_USER_ALREADY_MEMBER_ERROR,
  GROUP_USER_HAS_NO_INVITATION_ERROR,
  USER_NOT_FOUND_ERROR,
  groupDocumentMembersRef,
  groupDocumentRef,
  userDocumentRef,
} from '../models';
import { transformUserToGroupMember } from './../utils/transform.util';

/**
 * User accepts a group invitation
 * - check if user is already in group
 * - check if user has an invitation
 * - check if group will not have more than N members
 * - update user to join group
 * - update group
 */
export const groupMemberAcceptCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid as string;
  const requestGroupId = request.data as string;

  return groupMemberAccept(userAuthId, requestGroupId);
});

/**
 *
 * @param userAuthId - user id to which to add to the group
 * @param requestGroupId - group id to which to add the user
 */
export const groupMemberAccept = async (userAuthId: string, requestGroupId: string): Promise<void> => {
  const userData = (await userDocumentRef(userAuthId).get()).data();
  const groupData = (await groupDocumentRef(requestGroupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // check user account type
  if (userData.userAccountType !== UserAccountEnum.DEMO_TRADING) {
    throw new HttpsError('aborted', 'User account type is not allowed to join group');
  }

  // check if user is already in group
  if (userData.groups.groupMember.includes(requestGroupId)) {
    throw new HttpsError('already-exists', GROUP_USER_ALREADY_MEMBER_ERROR);
  }

  // check if user has an invitation
  if (!userData.groups.groupInvitations.includes(requestGroupId)) {
    throw new HttpsError('failed-precondition', GROUP_USER_HAS_NO_INVITATION_ERROR);
  }

  // check if group will not have more than N members
  if (groupData.memberUserIds.length >= GROUP_MEMBER_LIMIT) {
    throw new HttpsError('resource-exhausted', GROUP_IS_FULL_ERROR);
  }

  // update user to join group
  await userDocumentRef(userAuthId).update({
    'groups.groupInvitations': FieldValue.arrayRemove(requestGroupId),
    'groups.groupMember': FieldValue.arrayUnion(requestGroupId),
  });

  // update group
  await groupDocumentRef(groupData.id).update({
    memberUserIds: FieldValue.arrayUnion(userAuthId), // add user to members
    memberInvitedUserIds: FieldValue.arrayRemove(userAuthId), // remove invitation
    numberOfMembers: FieldValue.increment(1), // increment number of members
  });

  // update group members
  await groupDocumentMembersRef(groupData.id).update({
    data: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(userData, groupData.memberUserIds.length + 1),
    }),
  });
};
