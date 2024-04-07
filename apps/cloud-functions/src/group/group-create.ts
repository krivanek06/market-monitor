import {
  GROUP_MEMBERS_LIMIT_ERROR,
  GROUP_MEMBER_LIMIT,
  GROUP_OWNER_LIMIT,
  GROUP_OWNER_LIMIT_ERROR,
  GROUP_SAME_NAME_ERROR,
  GroupCreateInput,
  GroupData,
  USER_NOT_AUTHENTICATED_ERROR,
  USER_NOT_FOUND_ERROR,
  UserBase,
} from '@mm/api-types';
import { createEmptyPortfolioState, getCurrentDateDefaultFormat } from '@mm/shared/general-util';
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
import { transformUserToBase, transformUserToGroupMember } from '../utils';

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
    throw new Error(USER_NOT_AUTHENTICATED_ERROR);
  }

  return groupCreate(data, userAuthId);
});

export const groupCreate = async (data: GroupCreateInput, userAuthId: string): Promise<GroupData> => {
  // load user data from firebase
  const userDataDoc = await userDocumentRef(userAuthId).get();
  const userData = userDataDoc.data();
  const isOwnerMember = data.isOwnerMember;

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  const userBase = transformUserToBase(userData);
  const groupMembers = transformUserToGroupMember(userData, 1);
  const group = (await groupsCollectionRef().where('name', '==', data.groupName).get()).docs[0];

  // check if group already exists
  if (group) {
    throw new HttpsError('already-exists', GROUP_SAME_NAME_ERROR);
  }

  // check limit
  if (userData.groups.groupOwner.length >= GROUP_OWNER_LIMIT) {
    throw new HttpsError('resource-exhausted', GROUP_OWNER_LIMIT_ERROR);
  }

  // check members
  if (data.memberInvitedUserIds.length >= GROUP_MEMBER_LIMIT - (isOwnerMember ? 1 : 0)) {
    throw new HttpsError('resource-exhausted', GROUP_MEMBERS_LIMIT_ERROR);
  }

  // create group
  const newGroup = createGroup(data, userBase, isOwnerMember);
  const groupRef = groupDocumentRef(newGroup.id);

  // save new group
  await groupRef.set(newGroup);

  // create additional documents for group
  await groupDocumentTransactionsRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [],
  });

  // create members collection
  await groupDocumentMembersRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: isOwnerMember ? [groupMembers] : [],
  });

  // create portfolio snapshots collection
  await groupDocumentPortfolioStateSnapshotsRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [],
  });

  // create holding snapshots collection
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

  // update the owner's data in users collection
  userDataDoc.ref.update({
    'groups.groupMember': isOwnerMember ? FieldValue.arrayUnion(newGroup.id) : userData.groups.groupMember,
    'groups.groupOwner': FieldValue.arrayUnion(newGroup.id),
  });

  return newGroup;
};

const createGroup = (data: GroupCreateInput, owner: UserBase, isOwnerMember = false): GroupData => {
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
    memberUserIds: isOwnerMember ? [owner.id] : [],
    endDate: null,
    modifiedSubCollectionDate: getCurrentDateDefaultFormat(),
    portfolioState: {
      ...createEmptyPortfolioState(),
    },
    systemRank: {},
    numberOfMembers: 0,
  };
};
