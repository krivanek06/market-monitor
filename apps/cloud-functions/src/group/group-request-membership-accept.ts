import { GROUP_MEMBER_LIMIT, GroupBaseInput, GroupMember } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';
import { transformUserToGroupMember } from './../utils/transform.util';

/**
 * Group accepts the user request to join
 * - check if authenticated user is owner
 * - check if user sent request
 * - check if group will not have more than N members
 * - update group
 * - update group member data
 * - update user
 * - return removed user
 */
export const groupRequestMembershipAcceptCall = onCall(async (request) => {
  const data = request.data as GroupBaseInput;
  const userAuthId = request.auth?.uid;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();
  const userData = (await userDocumentRef(data.userId).get()).data();

  // check if authenticated user is owner
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('aborted', 'User is not owner');
  }

  // check if user sent request
  if (!groupData.memberRequestUserIds.includes(userAuthId)) {
    throw new HttpsError('failed-precondition', 'User has not requested to join');
  }

  // check if group will not have more than N members
  if (groupData.memberUserIds.length >= GROUP_MEMBER_LIMIT) {
    throw new HttpsError('resource-exhausted', 'Group is full');
  }

  // update group
  await groupDocumentRef(data.groupId).update({
    memberUserIds: FieldValue.arrayUnion(userAuthId),
    memberRequestUserIds: FieldValue.arrayRemove(userAuthId),
  });

  // update group member data
  await groupDocumentMembersRef(data.groupId).update({
    data: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(userData),
    }),
  });

  // update user
  await userDocumentRef(userAuthId).update({
    'groups.groupRequested': FieldValue.arrayRemove(data.groupId),
    'groups.groupMember': FieldValue.arrayUnion(data.groupId),
  });
});
