import { GroupBaseInput } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';

/**
 * Remove a user from a group or user leaves the group
 * - check if authenticated user is owner or the user who leaves
 * - check if user is in group
 * - remove user from group
 * - remove user from group member
 * - update user info
 * - return removed user
 */
export const groupMemberRemoveCall = onCall(async (request) => {
  const userAuthId = request.auth.uid as string;
  const data = request.data as GroupBaseInput;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();
  const groupMemberData = (await groupDocumentMembersRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', 'Group does not exist');
  }

  // check if authenticated user is owner or the user who leaves
  const canBeUserRemove = groupData.ownerUserId === userAuthId && data.userId === userAuthId;
  if (!canBeUserRemove) {
    throw new HttpsError('aborted', 'User can not be removed');
  }

  // check if user is in group
  if (!groupData.memberUserIds.includes(data.userId)) {
    throw new HttpsError('failed-precondition', 'User is not in group');
  }

  // remove user from group
  await groupDocumentRef(data.groupId).update({
    memberUserIds: FieldValue.arrayRemove(data.userId),
  });

  // remove user from group member
  await groupDocumentMembersRef(data.groupId).update({
    memberUsers: groupMemberData.memberUsers.filter((user) => user.id !== data.userId),
  });

  // update user info
  await userDocumentRef(data.userId).update({
    'groups.groupMember': FieldValue.arrayRemove(data.groupId),
  });
});
