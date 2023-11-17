import { GroupMember } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';
import { transformUserToGroupMember } from './../utils/transform.util';

/**
 * User accepts a group invitation
 * - check if user is already in group
 * - check if user has an invitation
 * - update user to join group
 * - update group
 */
export const groupMemberAcceptCall = onCall(async (request) => {
  const userAuthId = request.auth.uid as string;
  const requestGroupId = request.data as string;

  const userRef = await userDocumentRef(userAuthId).get();
  const userData = userRef.data();

  // check if user is already in group
  if (userData.groups.groupMember.includes(requestGroupId)) {
    throw new Error('User is already in group');
  }

  // check if user has an invitation
  if (!userData.groups.groupInvitations.includes(requestGroupId)) {
    throw new Error('User has no invitation');
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
