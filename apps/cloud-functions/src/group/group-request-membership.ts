import { FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { groupDocumentRef, userDocumentRef } from '../models';

/**
 * User request membership to a group
 * - check if user is already in group
 * - check if user already requested to join
 * - check if user already invited
 * - add user to requested list
 * - add group to user groupRequested
 */
export const groupRequestMembershipCall = onCall(async (request) => {
  const userAuthId = request.auth.uid as string;
  const groupId = request.data as string;

  const groupData = (await groupDocumentRef(groupId).get()).data();

  // check if group exists
  if (!groupData) {
    throw new Error('Group does not exist');
  }

  // check if user is already in group
  if (groupData.memberUserIds.includes(userAuthId)) {
    throw new Error('User is already in group');
  }

  // check if user already requested to join
  if (groupData.memberRequestUserIds.includes(userAuthId)) {
    throw new Error('User already requested to join');
  }

  // check if user already invited
  if (groupData.memberInvitedUserIds.includes(userAuthId)) {
    throw new Error('User already invited');
  }

  // group update - add user to requested list
  await groupDocumentRef(groupId).update({
    memberRequestUserIds: FieldValue.arrayUnion(userAuthId),
  });

  // user update - add group to user groupRequested
  await userDocumentRef(userAuthId).update({
    'groups.groupRequested': FieldValue.arrayUnion(groupId),
  });
});
