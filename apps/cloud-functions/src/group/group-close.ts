import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { GROUP_ALREADY_CLOSED_ERROR, GROUP_NOT_FOUND_ERROR, GROUP_USER_NOT_OWNER, groupDocumentRef } from '../models';

export const groupCloseCall = onCall(async (request) => {
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

  // check if group is closed
  if (groupData.isClosed) {
    throw new HttpsError('failed-precondition', GROUP_ALREADY_CLOSED_ERROR);
  }

  // close group
  await groupDocumentRef(groupId).update({
    isClosed: true,
    endDate: getCurrentDateDefaultFormat(),
  });

  return groupData;
});
