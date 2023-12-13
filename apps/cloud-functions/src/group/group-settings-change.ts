import { GroupSettingsChangeInput } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';

/**
 * Change group settings - only owner
 * User can change
 * - group name
 * - group image
 * - group isPublic
 * - remove group members
 */
export const groupSettingsChangeCall = onCall(async (request) => {
  const userAuthId = request.auth!.uid as string;
  const data = request.data as GroupSettingsChangeInput;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();
  const groupMemberData = (await groupDocumentMembersRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', 'Group does not exist');
  }

  // check if owner
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', 'User is not owner');
  }

  // check if member data exists
  if (!groupMemberData) {
    throw new HttpsError('not-found', 'Group member does not exist');
  }

  // update group data
  await groupDocumentRef(data.groupId).update({
    name: data.groupName,
    isPublic: data.isPublic,
    imageUrl: data.imageUrl,
    memberUserIds: groupData.memberUserIds.filter((user) => !data.removingUserIds.includes(user)),
  });

  // remove users from group member
  await groupDocumentMembersRef(data.groupId).update({
    data: groupMemberData.data.filter((user) => !data.removingUserIds.includes(user.id)),
  });

  // update each user document
  for await (const userId of data.removingUserIds) {
    await userDocumentRef(userId).update({
      'groups.groupMember': FieldValue.arrayRemove(data.groupId),
    });
  }
});
