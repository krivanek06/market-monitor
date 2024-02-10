import { GroupBaseInput } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR,
  GROUP_NOT_FOUND_ERROR,
  groupDocumentMembersRef,
  groupDocumentRef,
  userDocumentRef,
} from '../models';

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
  const userAuthId = request.auth?.uid as string;
  const data = request.data as GroupBaseInput;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();
  const groupMemberData = (await groupDocumentMembersRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if member data exists
  if (!groupMemberData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if authenticated user is owner or the user who leaves
  const canBeUserRemove = groupData.ownerUserId === userAuthId || data.userId === userAuthId;
  if (!canBeUserRemove) {
    throw new HttpsError('aborted', GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR);
  }

  // remove user from group
  await groupDocumentRef(data.groupId).update({
    memberUserIds: FieldValue.arrayRemove(data.userId),
    numberOfMembers: FieldValue.increment(-1), // increment number of members
  });

  // remove user from group member
  await groupDocumentMembersRef(data.groupId).update({
    data: groupMemberData.data.filter((user) => user.id !== data.userId),
  });

  // update user info
  await userDocumentRef(data.userId).update({
    'groups.groupMember': FieldValue.arrayRemove(data.groupId),
  });
});
