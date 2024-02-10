import { GroupBaseInputInviteMembers } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { GROUP_NOT_FOUND_ERROR, GROUP_USER_NOT_OWNER, groupDocumentRef, userDocumentRef } from '../models';

/**
 * Invite a user to a group
 * - check if authenticated user is owner
 * - check if user is already in group
 * - check if user already requested to join
 * - check if user already invited
 * - add user to invited list
 * - add group to user groupInvitations
 */
export const groupMemberInviteMultipleCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid as string;
  const data = request.data as GroupBaseInputInviteMembers;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if owner
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // get user ids that are not already in group or invited or requested
  const usedUserIds = [
    groupData.ownerUserId,
    ...groupData.memberUserIds,
    ...groupData.memberRequestUserIds,
    ...groupData.memberInvitedUserIds,
  ];
  const filteredOutUserIds = data.userIds.filter((userId) => !usedUserIds.includes(userId));

  if (filteredOutUserIds.length === 0) {
    return 0;
  }

  // add users to invited list
  await groupDocumentRef(data.groupId).update({
    memberInvitedUserIds: FieldValue.arrayUnion(...filteredOutUserIds),
  });

  // add group to user groupInvitations
  for await (const userId of filteredOutUserIds) {
    await userDocumentRef(userId).update({
      'groups.groupInvitations': FieldValue.arrayUnion(data.groupId),
    });
  }

  return filteredOutUserIds.length;
});
