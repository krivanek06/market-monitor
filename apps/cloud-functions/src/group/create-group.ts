import { GROUP_OWNER_LIMIT, GroupCreateInput, GroupData } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';
import { onCall } from 'firebase-functions/v2/https';
import { arrayUnion } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { groupDocumentRef, userDocumentRef } from '../models';

export const createGroupWrapper = onCall(async (request) => {
  const data = request.data as GroupCreateInput;
  const user = request.auth?.uid;

  if (!user) {
    throw new Error('User not authenticated');
  }

  console.log('data', data);
  console.log('user', user);

  // load user data from firebase
  const userDataDoc = await userDocumentRef(user).get();
  const userData = userDataDoc.data();

  // check limit
  if (userData.groups.groupOwner.length >= GROUP_OWNER_LIMIT) {
    throw new Error(`User can only create ${GROUP_OWNER_LIMIT} groups`);
  }

  // create group
  const newGroup = createGroup(data, user);

  // save new group
  await groupDocumentRef(newGroup.id).set(newGroup);

  // update member list
  for await (const memberId of data.memberInvitedUserIds) {
    await userDocumentRef(memberId).update({
      groups: {
        groupMember: arrayUnion(newGroup.id),
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

const createGroup = (data: GroupCreateInput, ownerId: string): GroupData => {
  return {
    id: uuidv4(),
    name: data.groupName,
    imageUrl: data.imageUrl,
    isPublic: data.isPublic,
    memberInvitedUserIds: data.memberInvitedUserIds,
    ownerUserId: ownerId,
    createdDate: getCurrentDateDefaultFormat(),
    isClosed: false,
    memberRequestUserIds: [],
    memberUserIds: [],
  };
};
