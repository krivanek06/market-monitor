import { GROUP_NOT_FOUND_ERROR, GROUP_USER_NOT_OWNER } from '@mm/api-types';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentRef } from '../models';

/**
 * if the group is closed, reopen it
 */
export const groupReopenCall = onCall(async (request) => {
  const groupId = request.data as string;
  const userAuthId = request.auth?.uid;

  const groupRef = await groupDocumentRef(groupId).get();
  const groupData = groupRef.data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if owner match request user id
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // close group
  await groupDocumentRef(groupId).update({
    isClosed: false,
    endDate: null,
  });

  return groupData;
});
