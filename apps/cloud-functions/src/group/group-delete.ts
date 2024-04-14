import { GROUP_NOT_FOUND_ERROR, GROUP_USER_NOT_OWNER, GroupData, USER_NOT_AUTHENTICATED_ERROR } from '@mm/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, groupDocumentTransactionsRef, userDocumentRef } from '../models';

/**
 * Delete a group
 * - remove group from owner
 * - remove group from all users
 * - delete group and all subgroups
 * - return removed group
 *
 * PS: This function is not used in the app, it is only for testing purposes
 */
export const groupDeleteCall = onCall(async (request) => {
  const groupId = request.data as string;
  const userAuthId = request.auth?.uid;

  if (!userAuthId) {
    throw new HttpsError('unauthenticated', USER_NOT_AUTHENTICATED_ERROR);
  }

  try {
    return groupDeleteData(userAuthId, groupId);
  } catch (error) {
    throw new HttpsError('internal', 'Unable to delete group, please contact support');
  }
});

export const groupDeleteData = async (userAuthId: string, groupId: string): Promise<GroupData> => {
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

  // remove group from owner
  await userDocumentRef(userAuthId).update({
    'groups.groupOwner': FieldValue.arrayRemove(groupId),
  });

  // remove group all users even if there is a bug, remove all data
  const userIds = [...groupData.memberUserIds, ...groupData.memberInvitedUserIds, ...groupData.memberRequestUserIds];
  for await (const userId of userIds) {
    await userDocumentRef(userId).update({
      'groups.groupInvitations': FieldValue.arrayRemove(groupId),
      'groups.groupMember': FieldValue.arrayRemove(groupId),
      'groups.groupRequested': FieldValue.arrayRemove(groupId),
    });
  }

  // delete subgroups and group
  await groupDocumentMembersRef(groupId).delete();
  await groupDocumentTransactionsRef(groupId).delete();
  await groupDocumentRef(groupId).delete();

  // return removed group
  return groupData;
};
