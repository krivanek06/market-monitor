import {
  GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR,
  GROUP_NOT_FOUND_ERROR,
  GROUP_USER_HAS_NO_INVITATION_ERROR,
  GroupBaseInput,
} from '@mm/api-types';
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
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if requestor is owner
  if (groupData.ownerUserId !== userAuthId && data.userId !== userAuthId) {
    throw new HttpsError('failed-precondition', GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR);
  }

  // check is user is invited
  if (!groupData.memberInvitedUserIds.includes(data.userId)) {
    throw new HttpsError('failed-precondition', GROUP_USER_HAS_NO_INVITATION_ERROR);
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
