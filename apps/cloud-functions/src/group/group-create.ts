import { GROUP_OWNER_LIMIT, GroupCreateInput, GroupData, UserBase } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
import { onCall } from 'firebase-functions/v2/https';
import { arrayUnion } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { groupDocumentMembersRef, groupDocumentRef, groupDocumentTransactionsRef, userDocumentRef } from '../models';
import { transformUserToBase } from '../utils';

/**
 * Create a new group
 * - create group
 * - create additional documents for group: transactions, members
 * - add group into users.groupOwner
 * - add group into users.groupInvitations
 */
export const groupCreateCall = onCall(async (request) => {
  const data = request.data as GroupCreateInput;
  const userAuthId = request.auth?.uid;

  if (!userAuthId) {
    throw new Error('User not authenticated');
  }

  console.log('data', data);
  console.log('user', userAuthId);

  // load user data from firebase
  const userDataDoc = await userDocumentRef(userAuthId).get();
  const userData = userDataDoc.data();
  const userBase = transformUserToBase(userData);

  // check limit
  if (userData.groups.groupOwner.length >= GROUP_OWNER_LIMIT) {
    throw new Error(`User can only create ${GROUP_OWNER_LIMIT} groups`);
  }

  // create group
  const newGroup = createGroup(data, userBase);
  const groupRef = groupDocumentRef(newGroup.id);

  // save new group
  await groupRef.set(newGroup);

  // create additional documents for group
  await groupDocumentTransactionsRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    lastTransactions: [],
  });

  await groupDocumentMembersRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    memberUsers: [],
  });

  // update member list
  for await (const memberId of data.memberInvitedUserIds) {
    await userDocumentRef(memberId).update({
      groups: {
        groupInvitations: arrayUnion(newGroup.id),
      },
    });
  }

  // add group to owner list
  userDataDoc.ref.update({
    groups: {
      groupMember: data.isOwnerMember ? [...userData.groups.groupMember, newGroup.id] : userData.groups.groupMember,
      groupOwner: [...userData.groups.groupOwner, newGroup.id],
    },
  });

  return newGroup;
});

const createGroup = (data: GroupCreateInput, owner: UserBase): GroupData => {
  return {
    id: uuidv4(),
    name: data.groupName,
    imageUrl: data.imageUrl,
    isPublic: data.isPublic,
    memberInvitedUserIds: data.memberInvitedUserIds,
    ownerUserId: owner.id,
    ownerUser: owner,
    createdDate: getCurrentDateDefaultFormat(),
    isClosed: false,
    memberRequestUserIds: [],
    memberUserIds: [],
  };
};
