import { GROUP_NOT_FOUND_ERROR, GROUP_USER_NOT_OWNER, GroupData, GroupSettingsChangeInput } from '@mm/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';

/**
 * Change group settings - only owner
 * User can change
 * - group name
 * - group image
 * - group isPublic
 * - remove group members
 */
export const groupSettingsChangeCall = onCall(async (request: CallableRequest<GroupSettingsChangeInput>) => {
  const userAuthId = request.auth!.uid as string;
  const data = request.data;

  const groupData = (await groupDocumentRef(data.groupId).get()).data();
  const groupMemberData = (await groupDocumentMembersRef(data.groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if owner
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // check if member data exists
  if (!groupMemberData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // update group data
  await groupDocumentRef(data.groupId).update({
    name: data.groupName,
    nameLowerCase: data.groupName.toLowerCase(),
    isPublic: data.isPublic,
    imageUrl: data.imageUrl,
    memberUserIds: groupData.memberUserIds.filter((user) => !data.removingUserIds.includes(user)),
  } satisfies Partial<GroupData>);

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
