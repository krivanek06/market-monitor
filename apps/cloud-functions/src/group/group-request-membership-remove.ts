import { GroupBaseInput } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR,
  GROUP_NOT_FOUND_ERROR,
  USER_NOT_FOUND_ERROR,
  groupDocumentRef,
  userDocumentRef,
} from '../models';

/**
 * Remove user who request to join the group - only owner or the requester can do it
 * - check if authenticated user is owner or the user who leaves
 * - update group
 * - update user
 * - return removed user
 */
export const groupRequestMembershipRemoveCall = onCall(async (request) => {
  const data = request.data as GroupBaseInput;
  const userAuthId = request.auth?.uid;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();
  const userData = (await userDocumentRef(data.userId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // check if authenticated user is owner or the user who leaves
  const canBeUserRemove = groupData.ownerUserId === userAuthId || data.userId === userAuthId;
  if (!canBeUserRemove) {
    throw new HttpsError('aborted', GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR);
  }

  // update group
  await groupDocumentRef(data.groupId).update({
    memberRequestUserIds: FieldValue.arrayRemove(data.userId),
  });

  // update user
  await userDocumentRef(data.userId).update({
    'groups.groupRequested': FieldValue.arrayRemove(data.groupId),
  });
});
