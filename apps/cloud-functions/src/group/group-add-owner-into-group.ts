import { GroupMember } from '@market-monitor/api-types';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';
import { transformUserToGroupMember } from './../utils/transform.util';

export const groupAddOwnerIntoGroupCall = onCall(async (request) => {
  const userAuthId = request.auth.uid as string;
  const groupId = request.data as string;

  const groupData = (await groupDocumentRef(groupId).get()).data();
  const userData = (await userDocumentRef(userAuthId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new HttpsError('not-found', 'Group does not exist');
  }

  // check if owner match request user id
  if (groupData.ownerUserId !== userAuthId) {
    throw new HttpsError('failed-precondition', 'User is not owner');
  }

  // update group
  await groupDocumentRef(groupId).update({
    memberUserIds: FieldValue.arrayUnion(userAuthId),
    memberRequestUserIds: FieldValue.arrayRemove(userAuthId),
  });

  // update group member data
  await groupDocumentMembersRef(groupId).update({
    memberUsers: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(userData),
    }),
  });

  // update user
  await userDocumentRef(userAuthId).update({
    'groups.groupMember': FieldValue.arrayUnion(groupId),
  });
});
