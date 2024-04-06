import { GROUP_ALREADY_CLOSED_ERROR, GROUP_NOT_FOUND_ERROR, GROUP_USER_NOT_OWNER, GroupData } from '@mm/api-types';
import { getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentRef } from '../models';

export const groupCloseCall = onCall(async (request: CallableRequest<string>): Promise<GroupData> => {
  const groupId = request.data;
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
