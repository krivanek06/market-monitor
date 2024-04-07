import {
  GROUP_IS_FULL_ERROR,
  GROUP_MEMBER_LIMIT,
  GROUP_NOT_FOUND_ERROR,
  GROUP_USER_NOT_OWNER,
  GroupMember,
  USER_NOT_FOUND_ERROR,
} from '@mm/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';
import { transformUserToGroupMember } from './../utils/transform.util';

export const groupAddOwnerIntoGroupCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid as string;
  const groupId = request.data as string;

  const groupData = (await groupDocumentRef(groupId).get()).data();
  const userData = (await userDocumentRef(userAuthId).get()).data();

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', GROUP_NOT_FOUND_ERROR);
  }

  // check if owner match request user id
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // check if group will not have more than N members
  if (groupData.memberUserIds.length >= GROUP_MEMBER_LIMIT) {
    throw new HttpsError('resource-exhausted', GROUP_IS_FULL_ERROR);
  }

  // update group
  await groupDocumentRef(groupId).update({
    memberUserIds: FieldValue.arrayUnion(userAuthId),
    memberRequestUserIds: FieldValue.arrayRemove(userAuthId),
  });

  // update group member data
  await groupDocumentMembersRef(groupId).update({
    data: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(userData, groupData.memberUserIds.length + 1),
    }),
  });

  // update user
  await userDocumentRef(userAuthId).update({
    'groups.groupMember': FieldValue.arrayUnion(groupId),
  });
});
