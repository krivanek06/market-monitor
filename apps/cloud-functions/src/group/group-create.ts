import {
  GROUP_MEMBER_LIMIT,
  GROUP_OWNER_LIMIT,
  GroupCreateInput,
  GroupData,
  UserBase,
} from '@market-monitor/api-types';
import { createEmptyPortfolioState, getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import {
  groupDocumentHoldingSnapshotsRef,
  groupDocumentMembersRef,
  groupDocumentPortfolioStateSnapshotsRef,
  groupDocumentRef,
  groupDocumentTransactionsRef,
  groupsCollectionRef,
  userDocumentRef,
} from '../models';
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

  // load user data from firebase
  const userDataDoc = await userDocumentRef(userAuthId).get();
  const userData = userDataDoc.data();

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', 'User does not exist');
  }

  const userBase = transformUserToBase(userData);
  const group = (await groupsCollectionRef().where('name', '==', data.groupName).get()).docs[0];

  // check if group already exists
  if (group) {
    throw new HttpsError('already-exists', 'Group with same name already exists');
  }

  // check to load user
  if (!userData) {
    throw new HttpsError('cancelled', 'User not found');
  }

  // check limit
  if (userData.groups.groupOwner.length >= GROUP_OWNER_LIMIT) {
    throw new HttpsError('resource-exhausted', `User can only create ${GROUP_OWNER_LIMIT} groups`);
  }

  // check members
  if (data.memberInvitedUserIds.length >= GROUP_MEMBER_LIMIT - (data.isOwnerMember ? 1 : 0)) {
    throw new HttpsError('resource-exhausted', `Group can only have ${GROUP_MEMBER_LIMIT} members`);
  }

  // create group
  const newGroup = createGroup(data, userBase);
  const groupRef = groupDocumentRef(newGroup.id);

  // save new group
  await groupRef.set(newGroup);

  // create additional documents for group
  await groupDocumentTransactionsRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [],
  });

  await groupDocumentMembersRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [],
  });

  await groupDocumentPortfolioStateSnapshotsRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [],
  });

  await groupDocumentHoldingSnapshotsRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [],
  });

  // update member list
  for await (const memberId of data.memberInvitedUserIds) {
    await userDocumentRef(memberId).update({
      'groups.groupInvitations': FieldValue.arrayUnion(newGroup.id),
    });
  }

  // add group to owner list
  userDataDoc.ref.update({
    'groups.groupMember': data.isOwnerMember ? FieldValue.arrayUnion(newGroup.id) : userData.groups.groupMember,
    'groups.groupOwner': FieldValue.arrayUnion(newGroup.id),
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
    endDate: null,
    modifiedSubCollectionDate: getCurrentDateDefaultFormat(),
    portfolioState: {
      ...createEmptyPortfolioState(),
    },
  };
};
