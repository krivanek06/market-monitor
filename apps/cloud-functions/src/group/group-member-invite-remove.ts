import { GroupBaseInput } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentRef, userDocumentRef } from '../models';

/**
 * Remove a group invitation sent to the user by the owner or the user itself
 * - check if authenticated user is owner or the user who leaves
 * - update group
 * - update user
 * - return removed user
 */
export const groupMemberInviteRemoveCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid as string;
  const data = request.data as GroupBaseInput;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', 'Group does not exist');
  }

  // check if requestor is owner
  if (groupData.ownerUserId !== userAuthId && data.userId !== userAuthId) {
    throw new HttpsError('failed-precondition', 'User is not owner or the user itself');
  }

  // check is user is invited
  if (!groupData.memberInvitedUserIds.includes(data.userId)) {
    throw new HttpsError('failed-precondition', 'User is not invited');
  }

  // group - remove user from invited list
  await groupDocumentRef(data.groupId).update({
    memberInvitedUserIds: FieldValue.arrayRemove(data.userId),
  });

  // user - remove group from groupInvitations
  await userDocumentRef(data.userId).update({
    'groups.groupInvitations': FieldValue.arrayRemove(data.groupId),
  });
});
