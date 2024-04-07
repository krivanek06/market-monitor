import {
  GROUPS_USER_ALREADY_INVITED_ERROR,
  GROUP_NOT_FOUND_ERROR,
  GROUP_USER_ALREADY_MEMBER_ERROR,
} from '@mm/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentRef, userDocumentRef } from '../models';

/**
 * User request membership to a group
 * - check if user is already in group
 * - check if user already requested to join
 * - check if user already invited
 * - add user to requested list
 * - add group to user groupRequested
 */
export const groupRequestMembershipCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid as string;
  const groupId = request.data as string;

  const groupData = (await groupDocumentRef(groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if user is already in group
  if (groupData.memberUserIds.includes(userAuthId)) {
    throw new HttpsError('already-exists', GROUP_USER_ALREADY_MEMBER_ERROR);
  }

  // check if user already requested to join
  if (groupData.memberRequestUserIds.includes(userAuthId)) {
    throw new HttpsError('already-exists', GROUPS_USER_ALREADY_INVITED_ERROR);
  }

  // check if user already invited
  if (groupData.memberInvitedUserIds.includes(userAuthId)) {
    throw new HttpsError('already-exists', GROUPS_USER_ALREADY_INVITED_ERROR);
  }

  // group update - add user to requested list
  await groupDocumentRef(groupId).update({
    memberRequestUserIds: FieldValue.arrayUnion(userAuthId),
  });

  // user update - add group to user groupRequested
  await userDocumentRef(userAuthId).update({
    'groups.groupRequested': FieldValue.arrayUnion(groupId),
  });
});
