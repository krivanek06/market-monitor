import { faker } from '@faker-js/faker';
import {
  GroupCreateInput,
  GroupData,
  GroupPortfolioStateSnapshotsData,
  PortfolioState,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import { getRandomNumber, waitSeconds } from '@mm/shared/general-util';
import { format, subDays } from 'date-fns';
import { firestore } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { groupCreate, groupMemberAccept } from '../group';
import { groupDocumentPortfolioStateSnapshotsRef } from '../models';
import { calculateGroupMembersPortfolioState, groupCopyMembersAndTransactions } from '../schedulers/group-update-data';
import { createRandomUserAccounts } from '../user';
import { isFirebaseEmulator } from '../utils';
/**
 * Reload the database with new testing data
 * ONLY USE FOR TESTING / LOCAL DEVELOPMENT
 */
export const reloadDatabase = async (): Promise<void> => {
  if (!isFirebaseEmulator()) {
    console.warn('reloadDatabase() should only be used for testing / local development');
    return;
  }

  // delete previous data
  await deletePreviousData();

  // create users
  console.log('CREATE NEW USERS - START');
  const limitUsers = 50;
  const newUsers: UserData[] = [];

  for (let i = 0; i < limitUsers; i++) {
    const newUser = await createRandomUserAccounts({
      isDemo: false,
      userAccountType: UserAccountEnum.DEMO_TRADING,
      password: 'qwer1234',
    });
    // save new user
    newUsers.push(newUser);
    // wait 0.2s sec
    await waitSeconds(0.2);
    // log
    console.log(`User created: [${i + 1}/${limitUsers}]: ${newUser.personal.displayName}`);
  }

  console.log('CREATE NEW USERS - DONE');

  // create group data
  console.log('CREATE NEW GROUPS - START');
  // get 10 random users
  const owners = newUsers
    .filter((d) => d.userAccountType === UserAccountEnum.DEMO_TRADING)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  // generate groups
  for (const owner of owners) {
    console.log('Group created');
    const { createdGroup, groupMembers } = await createRandomGroup(owner, newUsers);
    console.log('Updating group data');
    await createGroupRandomPortfolioSnapshots(createdGroup, groupMembers);
    console.log('Updating group data');
    await groupCopyMembersAndTransactions(createdGroup);
  }
  console.log('CREATE NEW GROUPS - DONE');
};

/**
 * function to clear whole DB
 */
const deletePreviousData = async () => {
  // auth users
  console.log('REMOVE AUTH USERS');
  const userIds = (await getAuth().listUsers()).users.map((u) => u.uid);
  await getAuth().deleteUsers(userIds);

  // users
  console.log('REMOVE USERS');
  const userDoc = firestore().collection('users');
  firestore().recursiveDelete(userDoc);

  // groups
  console.log('REMOVE GROUPS');
  const groupDoc = firestore().collection('groups');
  firestore().recursiveDelete(groupDoc);

  // aggregations
  console.log('REMOVE AGGREGATIONS');
  const aggregationDoc = firestore().collection('aggregations');
  firestore().recursiveDelete(aggregationDoc);

  console.log('DELETED PREVIOUS DATA');
};

const createGroupRandomPortfolioSnapshots = async (
  createdGroup: GroupData,
  groupMembers: UserData[],
): Promise<PortfolioState[]> => {
  // portfolio snapshot of the group today
  const groupCurrentPortfolioSnapshot = calculateGroupMembersPortfolioState(groupMembers, createdGroup.portfolioState);
  // generate previous snapshots by changing the current snapshot for the past 60 days
  const groupPastPortfolioSnapshots = createRandomPortfolioSnapshotsFromCurrentOne(groupCurrentPortfolioSnapshot);
  // save portfolio state
  await groupDocumentPortfolioStateSnapshotsRef(createdGroup.id).update({
    data: groupPastPortfolioSnapshots,
  } satisfies Partial<GroupPortfolioStateSnapshotsData>);

  return groupPastPortfolioSnapshots;
};

export const createRandomGroup = async (
  owner: UserData,
  users: UserData[],
): Promise<{ createdGroup: GroupData; groupMembers: UserData[] }> => {
  // select users except owner to invite
  const addedUsersToGroup = users
    .filter((u) => u.id !== owner.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 30);
  const randomUsersNotOwnerToInvite = addedUsersToGroup.map((u) => u.id);

  const groupInput: GroupCreateInput = {
    groupName: 'demo_group',
    imageUrl: faker.image.url(),
    isOwnerMember: true,
    isPublic: true,
    memberInvitedUserIds: randomUsersNotOwnerToInvite,
  };

  // create groups
  const groupData = await groupCreate(groupInput, owner.id, true);

  // log
  console.log(`Group created: ${groupData.id} - ${groupData.name}`);

  // select random 15 users to be members of the group
  const randomUsersNotOwnerAndMembers = randomUsersNotOwnerToInvite.sort(() => 0.5 - Math.random()).slice(0, 20);
  for await (const userId of randomUsersNotOwnerAndMembers) {
    // add user to group
    await groupMemberAccept(userId, groupData.id);
    // wait 0.1s sec
    await waitSeconds(0.1);
  }

  console.log('Group members added');

  return { createdGroup: groupData, groupMembers: addedUsersToGroup };
};

/**
 * from the provided portfolio state create random portfolio snapshots for the past N days.
 * mostly used when creating demo data for groups
 */
const createRandomPortfolioSnapshotsFromCurrentOne = (portfolioState: PortfolioState): PortfolioState[] => {
  const portfolioInPast: PortfolioState[] = [];
  for (let i = 60; i > 1; i--) {
    const dayBefore = subDays(new Date(), i);
    const modifyingNumber = getRandomNumber(-1000, 1000);
    // create modified portfolio state
    const modifiedPortfolioState = {
      ...portfolioState,
      date: format(dayBefore, 'yyyy-MM-dd'),
      balance: portfolioState.balance + modifyingNumber,
      invested: portfolioState.invested + modifyingNumber,
      // change cash in reverse of invested
      cashOnHand: portfolioState.cashOnHand - modifyingNumber,
    } satisfies PortfolioState;
    // save portfolio snapshot
    portfolioInPast.push(modifiedPortfolioState);
  }

  return portfolioInPast;
};
