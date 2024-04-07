import {
  GROUP_USER_NOT_OWNER,
  USER_DEFAULT_STARTING_CASH,
  UserAccountEnum,
  UserData,
  UserResetTransactionsInput,
} from '@mm/api-types';
import { createEmptyPortfolioState } from '@mm/shared/general-util';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { groupDocumentMembersRef, groupDocumentRef, userDocumentRef } from '../models';
import { userDocumentTransactionHistoryRef } from './../models/user';

/**
 * Reset all transactions for a user
 */
export const userResetTransactionsCall = onCall(async (request) => {
  const data = request.data as UserResetTransactionsInput;
  const userAuthId = request.auth?.uid;

  const userDoc = await userDocumentRef(data.userId).get();
  const userData = userDoc.data();

  // check if owner match request user id
  if (data.userId !== userAuthId) {
    throw new HttpsError('failed-precondition', GROUP_USER_NOT_OWNER);
  }

  // check if user exists
  if (!userData) {
    throw new HttpsError('not-found', 'User does not exist');
  }

  // reset user's data
  const startingCash = data.accountTypeSelected === UserAccountEnum.DEMO_TRADING ? USER_DEFAULT_STARTING_CASH : 0;

  // clear group history where user if member
  await clearUserGroupMemberData(userData);
  // clear group history where user has received invitations
  await clearUserReceivedGroupInvitations(userData);
  // clear group history where user has requested to join
  await clearUserRequestGroup(userData);

  // delete transactions
  await userDocumentTransactionHistoryRef(userData.id).update({
    transactions: [],
  });

  // reset user portfolio state & groups
  await userDocumentRef(userData.id).update({
    ...userData,
    portfolioState: {
      ...createEmptyPortfolioState(startingCash),
    },
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupRequested: [],
      groupWatched: [],
    },
    userAccountType: data.accountTypeSelected,
  } satisfies UserData);
});

/**
 * remove user from group where user is member
 * @param userData - user data to reset
 */
const clearUserGroupMemberData = async (userData: UserData) => {
  for await (const groupId of userData.groups.groupMember) {
    // remove user from group
    await groupDocumentRef(groupId).update({
      memberUserIds: FieldValue.arrayRemove(userData.id),
      numberOfMembers: FieldValue.increment(-1), // increment number of members
    });

    const groupMemberData = (await groupDocumentMembersRef(groupId).get()).data();
    // remove user from group member
    if (groupMemberData) {
      await groupDocumentMembersRef(groupId).update({
        data: groupMemberData.data.filter((user) => user.id !== userData.id),
      });
    }
  }
};

const clearUserReceivedGroupInvitations = async (userData: UserData) => {
  for await (const groupId of userData.groups.groupInvitations) {
    // remove user from group
    await groupDocumentRef(groupId).update({
      memberInvitedUserIds: FieldValue.arrayRemove(userData.id),
    });
  }
};

const clearUserRequestGroup = async (userData: UserData) => {
  for await (const groupId of userData.groups.groupRequested) {
    // remove user from group
    await groupDocumentRef(groupId).update({
      memberRequestUserIds: FieldValue.arrayRemove(userData.id),
    });
  }
};
