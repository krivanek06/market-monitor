import { faker } from '@faker-js/faker';
import {
  GroupCreateInput,
  GroupData,
  GroupMember,
  GroupPortfolioStateSnapshotsData,
  PortfolioState,
  TEST_CUSTOM_USER_1,
  TEST_PASSWORD,
  UserAccountEnum,
  UserBase,
  UserData,
} from '@mm/api-types';
import {
  createEmptyPortfolioState,
  getCurrentDateDefaultFormat,
  getRandomNumber,
  getYesterdaysDate,
  transformUserToBase,
  transformUserToGroupMember,
  waitSeconds,
} from '@mm/shared/general-util';
import { format, subDays } from 'date-fns';
import { firestore } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  groupDocumentHoldingSnapshotsRef,
  groupDocumentMembersRef,
  groupDocumentPortfolioStateSnapshotsRef,
  groupDocumentRef,
  groupDocumentTransactionsRef,
  userDocumentRef,
} from '../database';
import { calculateGroupMembersPortfolioState } from '../group';
import { CreateDemoAccountService, userCreate } from '../user';
import { isFirebaseEmulator } from '../utils';

/**
 * Reload the database with new testing data
 * ONLY USE FOR TESTING / LOCAL DEVELOPMENT
 */
export const testReloadDatabase = async (normalUsers = 10, demoUsers = 150): Promise<UserData[]> => {
  if (!isFirebaseEmulator()) {
    console.warn('reloadDatabase() should only be used for testing / local development');
    return [];
  }

  // delete previous data
  await deletePreviousData();

  // create users
  console.log('CREATE NEW USERS - NORMAL - START');
  const demoService = new CreateDemoAccountService();

  const newUsersDemo: UserData[] = [];
  const newUsersNormal: UserData[] = [];

  await demoService.initService();

  // create normal users
  for (let i = 0; i < normalUsers; i++) {
    // create demo accounts
    const newDemoUser = await demoService.createRandomUser({
      isDemo: false,
      password: TEST_PASSWORD,
    });

    // create user document
    const newUser = await userCreate(newDemoUser, {
      isDemo: false,
      userAccountType: UserAccountEnum.NORMAL_BASIC,
    });

    // create watchList
    await demoService.createWatchListWithRandomSymbols(newUser);

    // generate transactions
    const transactions = await demoService.generateTransactionsForRandomSymbols(newUser);

    // create portfolio growth data
    await demoService.generatePortfolioGrowthData(newUser, transactions);

    // save new user
    newUsersNormal.push(newUser);

    // wait 0.2s sec
    await waitSeconds(0.2);

    // log
    console.log(`User normal created: [${i + 1}/${normalUsers}]`);
  }
  console.log(`CREATE NEW USERS NORMAL DONE - ${normalUsers} USERS`);

  console.log('CREATE NEW USERS - TRADING - START');

  // create trading users
  for (let i = 0; i < demoUsers; i++) {
    // create demo accounts
    const newDemoUser = await demoService.createRandomUser({
      isDemo: false,
      password: TEST_PASSWORD,
    });

    // create user document
    const newUser = await userCreate(newDemoUser, {
      isDemo: false,
      userAccountType: UserAccountEnum.DEMO_TRADING,
    });

    // create watchList
    await demoService.createWatchListWithRandomSymbols(newUser);

    // generate transactions
    const transactions = await demoService.generateTransactionsForRandomSymbols(newUser);

    // create portfolio growth data
    await demoService.generatePortfolioGrowthData(newUser, transactions);

    // save new user
    newUsersDemo.push(newUser);
    // wait 0.2s sec
    await waitSeconds(0.2);
    // log
    console.log(`User trading created: [${i + 1}/${demoUsers}]: ${newUser.personal.displayName}`);
  }

  console.log(`CREATE NEW USERS TRADING DONE - ${newUsersDemo.length} USERS`);

  // create custom users
  const customDemo1 = await demoService.createRandomUser({
    email: TEST_CUSTOM_USER_1.email,
    name: TEST_CUSTOM_USER_1.name,
    password: TEST_PASSWORD,
  });
  // create user document
  const newCustomDemo1 = await userCreate(customDemo1, {
    isDemo: false,
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  // create watchList
  await demoService.createWatchListWithRandomSymbols(newCustomDemo1);

  // generate transactions
  const transactions = await demoService.generateTransactionsForRandomSymbols(newCustomDemo1);

  // create portfolio growth data
  await demoService.generatePortfolioGrowthData(newCustomDemo1, transactions);

  // create group data
  console.log('CREATE NEW GROUPS - START');

  // get 10 random users
  const owners = [
    newCustomDemo1,
    ...newUsersDemo.filter((d) => d.userAccountType === UserAccountEnum.DEMO_TRADING).slice(0, 10),
  ];

  // generate groups
  for (const owner of owners) {
    console.log('Group created');
    const { createdGroup, groupMembers } = await createRandomGroup(owner, newUsersDemo);
    console.log('Updating group data');
    await createGroupRandomPortfolioSnapshots(createdGroup, groupMembers);
  }
  console.log('CREATE NEW GROUPS - DONE');

  return [...newUsersNormal, ...newUsersDemo, newCustomDemo1];
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

const createRandomGroup = async (
  owner: UserData,
  users: UserData[],
): Promise<{ createdGroup: GroupData; groupMembers: UserData[] }> => {
  // select users except owner to invite
  const addedUsersToGroup = users.filter((u) => u.id !== owner.id).slice(0, 30);

  const randomUsersNotOwnerToInvite = addedUsersToGroup.map((u) => u.id);

  const groupInput: GroupCreateInput = {
    groupName: `Demo_${faker.company.name()}`,
  };

  // create groups
  const groupData = await groupCreate(groupInput, owner, true);

  // log
  console.log(`Group created: ${groupData.id} - ${groupData.name}`);

  // select random 15 users to be members of the group
  const randomUsersNotOwnerAndMembers = randomUsersNotOwnerToInvite.slice(0, 25);
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
  for (let i = 60; i > 0; i--) {
    const dayBefore = subDays(new Date(), i);
    const modifyingNumber = getRandomNumber(-2000, 2000);
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

/**
 * Create a new group
 * - create group
 * - create additional documents for group: transactions, members
 * - add group into users.groupOwner
 * - add group into users.groupInvitations
 */
const groupCreate = async (data: GroupCreateInput, userData: UserData, isDemo = false): Promise<GroupData> => {
  // load user data from firebase
  const userDataDoc = await userDocumentRef(userData.id).get();

  const userBase = transformUserToBase(userData);
  const groupMembers = transformUserToGroupMember(userData, 1);

  // create group
  const newGroup = createGroup(data, userBase);

  // save new group
  await groupDocumentRef(newGroup.id).set(newGroup);

  // create additional documents for group
  await groupDocumentTransactionsRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [],
    transactionBestReturn: [],
    transactionsWorstReturn: [],
  });

  // create members collection
  await groupDocumentMembersRef(newGroup.id).set({
    lastModifiedDate: getCurrentDateDefaultFormat(),
    data: [groupMembers],
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
  for await (const memberId of data?.memberInvitedUserIds ?? []) {
    await userDocumentRef(memberId).update({
      'groups.groupInvitations': FieldValue.arrayUnion(newGroup.id),
    });
  }

  // update the owner's data in users collection
  userDataDoc.ref.update({
    'groups.groupMember': FieldValue.arrayUnion(newGroup.id),
    'groups.groupOwner': FieldValue.arrayUnion(newGroup.id),
  });

  return newGroup;
};

/**
 *
 * @param data - basic information about the group
 * @param owner - who the group belongs to
 * @param isOwnerMember - is the owner a member of the group or not
 * @param isDemo - if true, group is for demo purposes
 * @returns created group
 */
const createGroup = (data: GroupCreateInput, owner: UserBase): GroupData => {
  return {
    id: `demo_${uuidv4()}`,
    name: data.groupName,
    nameLowerCase: data.groupName.toLowerCase(),
    imageUrl: faker.image.urlPicsumPhotos(),
    isPublic: true,
    memberInvitedUserIds: [],
    ownerUserId: owner.id,
    ownerUser: owner,
    createdDate: getCurrentDateDefaultFormat(),
    isClosed: false,
    memberRequestUserIds: [],
    memberUserIds: [owner.id],
    endDate: null,
    modifiedSubCollectionDate: getYesterdaysDate(),
    portfolioState: {
      ...createEmptyPortfolioState(),
    },
    systemRank: {},
    numberOfMembers: 1,
  };
};

/**
 *
 * @param userAuthId - user id to which to add to the group
 * @param requestGroupId - group id to which to add the user
 */
const groupMemberAccept = async (userAuthId: string, requestGroupId: string): Promise<void> => {
  const userData = (await userDocumentRef(userAuthId).get()).data();
  const groupData = (await groupDocumentRef(requestGroupId).get()).data();

  // check if group exists
  if (!groupData || !userData) {
    return;
  }
  // update user to join group
  await userDocumentRef(userAuthId).update({
    'groups.groupInvitations': FieldValue.arrayRemove(requestGroupId),
    'groups.groupMember': FieldValue.arrayUnion(requestGroupId),
  });

  // update group
  await groupDocumentRef(groupData.id).update({
    memberUserIds: FieldValue.arrayUnion(userAuthId), // add user to members
    memberInvitedUserIds: FieldValue.arrayRemove(userAuthId), // remove invitation
    numberOfMembers: FieldValue.increment(1), // increment number of members
  });

  // update group members
  await groupDocumentMembersRef(groupData.id).update({
    data: FieldValue.arrayUnion(<GroupMember>{
      ...transformUserToGroupMember(userData, groupData.memberUserIds.length + 1),
    }),
  });
};
