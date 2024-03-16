import { GroupBaseInput } from '@mm/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  GROUPS_USER_ALREADY_INVITED_ERROR,
  GROUP_NOT_FOUND_ERROR,
  GROUP_USER_ALREADY_MEMBER_ERROR,
  GROUP_USER_ALREADY_REQUESTED_ERROR,
  GROUP_USER_IS_OWNER_ERROR,
  GROUP_USER_NOT_OWNER,
  groupDocumentRef,
  userDocumentRef,
} from '../models';

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
  const userAuthId = request.auth?.uid as string;
  const data = request.data as GroupBaseInput;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if owner
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // check if user is owner
  if (groupData.ownerUserId === data.userId) {
    throw new HttpsError('failed-precondition', GROUP_USER_IS_OWNER_ERROR);
  }

  // check if user is already in group
  if (groupData.memberUserIds.includes(data.userId)) {
    throw new HttpsError('already-exists', GROUP_USER_ALREADY_MEMBER_ERROR);
  }

  // check if user already requested to join
  if (groupData.memberRequestUserIds.includes(data.userId)) {
    throw new HttpsError('already-exists', GROUP_USER_ALREADY_REQUESTED_ERROR);
  }

  // check if user already invited
  if (groupData.memberInvitedUserIds.includes(data.userId)) {
    throw new HttpsError('already-exists', GROUPS_USER_ALREADY_INVITED_ERROR);
  }

  // add user to invited list
  await groupDocumentRef(data.groupId).update({
    memberInvitedUserIds: FieldValue.arrayUnion(data.userId),
  });

  // add group to user groupInvitations
  await userDocumentRef(data.userId).update({
    'groups.groupInvitations': FieldValue.arrayUnion(data.groupId),
  });
});
