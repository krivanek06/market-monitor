import { GROUP_MEMBER_LIMIT, GroupMember } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';
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
  const userAuthId = request.auth.uid as string;
  const requestGroupId = request.data as string;

  const userData = (await userDocumentRef(userAuthId).get()).data();
  const groupData = (await groupDocumentRef(requestGroupId).get()).data();

  // check if user is already in group
  if (userData.groups.groupMember.includes(requestGroupId)) {
    throw new HttpsError('already-exists', 'User is already in group');
  }

  // check if user has an invitation
  if (!userData.groups.groupInvitations.includes(requestGroupId)) {
    throw new HttpsError('failed-precondition', 'User has no invitation');
  }

  // check if group will not have more than N members
  if (groupData.memberUserIds.length >= GROUP_MEMBER_LIMIT) {
    throw new HttpsError('resource-exhausted', 'Group is full');
  }

  // update user to join group
  await userDocumentRef(userAuthId).update({
    'groups.groupInvitations': FieldValue.arrayRemove(requestGroupId),
    'groups.groupMember': FieldValue.arrayUnion(requestGroupId),
  });

  // update group
  await groupDocumentRef(userAuthId).update({
    memberUserIds: FieldValue.arrayUnion(userAuthId), // add user to members
    memberInvitedUserIds: FieldValue.arrayRemove(userAuthId), // remove invitation
  });

  // update group members
  await groupDocumentMembersRef(userAuthId).update({
    memberUsers: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(userData),
    }),
  });
});
