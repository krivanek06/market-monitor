import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentRef } from '../models';

export const groupCloseCall = onCall(async (request) => {
  const groupId = request.data as string;
  const userAuthId = request.auth?.uid;

  const groupRef = await groupDocumentRef(groupId).get();
  const groupData = groupRef.data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', 'Group does not exist');
  }

  // check if owner match request user id
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', 'User is not owner');
  }

  // close group
  await groupDocumentRef(groupId).update({
    isClosed: true,
    endDate: getCurrentDateDefaultFormat(),
  });

  return groupData;
});
