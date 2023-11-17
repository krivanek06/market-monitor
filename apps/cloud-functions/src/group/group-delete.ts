import { onCall } from 'firebase-functions/v2/https';
import { arrayRemove } from 'firebase/firestore';
import { groupDocumentMembersRef, groupDocumentRef, groupDocumentTransactionsRef, userDocumentRef } from '../models';

/**
 * Delete a group
 * - remove group from owner
 * - remove group from all users
 * - delete group and all subgroups
 * - return removed group
 */
export const groupDeleteCall = onCall(async (request) => {
  const groupId = request.data as string;
  const userAuthId = request.auth?.uid;

  if (!userAuthId) {
    throw new Error('User not authenticated');
  }

  const groupRef = await groupDocumentRef(groupId).get();
  const groupData = groupRef.data();

  // check if group exists
  if (!groupData) {
    throw new Error('Group does not exist');
  }

  // check if owner match request user id
  if (groupData.ownerUserId !== userAuthId) {
    throw new Error('User is not owner');
  }

  // remove group from owner
  await userDocumentRef(userAuthId).update({
    groups: {
      groupOwner: arrayRemove(groupId),
    },
  });

  // remove group all users even if there is a bug, remove all data
  const userIds = [...groupData.memberUserIds, ...groupData.memberInvitedUserIds, ...groupData.memberRequestUserIds];
  for await (const userId of userIds) {
    await userDocumentRef(userId).update({
      groups: {
        groupInvitations: arrayRemove(userId),
        groupMember: arrayRemove(userId),
        groupRequested: arrayRemove(userId),
      },
    });
  }

  // delete subgroups and group
  await groupDocumentMembersRef(groupId).delete();
  await groupDocumentTransactionsRef(groupId).delete();
  await groupDocumentRef(groupId).delete();

  // return removed group
  return groupData;
});
