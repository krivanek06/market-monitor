import { GroupBaseInput } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { groupDocumentRef, userDocumentRef } from '../models';

/**
 * Invite a user to a group
 * - check if authenticated user is owner
 * - check if user is already in group
 * - check if user already requested to join
 * - check if user already invited
 * - add user to invited list
 * - add group to user groupInvitations
 */
export const groupMemberInviteCall = onCall(async (request) => {
  const userAuthId = request.auth.uid as string;
  const data = request.data as GroupBaseInput;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new Error('Group does not exist');
  }

  // check if owner
  if (groupData.ownerUserId !== userAuthId) {
    throw new Error('User is not owner');
  }

  // check if user is already in group
  if (groupData.memberUserIds.includes(data.userId)) {
    throw new Error('User is already in group');
  }

  // check if user already requested to join
  if (groupData.memberRequestUserIds.includes(data.userId)) {
    throw new Error('User already requested to join');
  }

  // check if user already invited
  if (groupData.memberInvitedUserIds.includes(data.userId)) {
    throw new Error('User already invited');
  }

  // add user to invited list
  await groupDocumentRef(data.groupId).update({
    memberInvitedUserIds: FieldValue.arrayUnion(data.userId),
  });

  // add group to user groupInvitations
  await userDocumentRef(data.userId).update({
    groups: {
      groupInvitations: FieldValue.arrayUnion(data.groupId),
    },
  });
});
