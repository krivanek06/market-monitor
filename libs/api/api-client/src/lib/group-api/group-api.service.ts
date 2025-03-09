import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  collection,
  doc,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { faker } from '@faker-js/faker';
import {
  GROUP_OWNER_LIMIT,
  GROUP_OWNER_LIMIT_ERROR,
  GROUP_SAME_NAME_ERROR,
  GroupCreateInput,
  GroupData,
  GroupDetails,
  GroupGeneralActions,
  GroupHoldingSnapshotsData,
  GroupMembersData,
  GroupPortfolioStateSnapshotsData,
  GroupSettingsChangeInput,
  GroupTransactionsData,
  PortfolioStateHolding,
  PortfolioTransaction,
  PortfolioTransactionMore,
  USER_HAS_DEMO_ACCOUNT_ERROR,
  UserBase,
  UserData,
} from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import {
  createEmptyPortfolioState,
  getCurrentDateDefaultFormat,
  getYesterdaysDate,
  roundNDigits,
  transformUserToBase,
  transformUserToGroupMember,
} from '@mm/shared/general-util';
import { arrayUnion, limit } from 'firebase/firestore';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { Observable, catchError, combineLatest, lastValueFrom, map, of, switchMap, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { MarketApiService } from '../market-api/market-api.service';
import { UserApiService } from '../user-api/user-api.service';

@Injectable({
  providedIn: 'root',
})
export class GroupApiService {
  private readonly functions = inject(Functions);
  private readonly firestore = inject(Firestore);
  private readonly marketApiService = inject(MarketApiService);
  private readonly userApiService = inject(UserApiService);

  getGroupDataById(groupId: string): Observable<GroupData | undefined> {
    return rxDocData(this.getGroupDocRef(groupId), { idField: 'id' });
  }

  getGroupDataByIds(ids: string[]): Observable<GroupData[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }
    return rxCollectionData(query(this.getGroupCollectionRef(), where('id', 'in', ids)));
  }

  getGroupMembersDataById(groupId: string): Observable<GroupMembersData | undefined> {
    return rxDocData(this.getGroupMembersDocRef(groupId));
  }

  getGroupPortfolioTransactionsDataById(groupId: string): Observable<GroupTransactionsData | undefined> {
    return rxDocData(this.getGroupPortfolioTransactionDocRef(groupId));
  }

  getGroupPortfolioSnapshotsDataById(groupId: string): Observable<GroupPortfolioStateSnapshotsData | undefined> {
    return rxDocData(this.getGroupPortfolioSnapshotsDocRef(groupId));
  }

  getGroupHoldingSnapshotsDataById(groupId: string): Observable<GroupHoldingSnapshotsData | undefined> {
    return rxDocData(this.getGroupHoldingSnapshotsDocRef(groupId));
  }

  getGroupsDataByIds(groupIds: string[]): Observable<GroupData[]> {
    if (groupIds.length === 0) {
      return of([]);
    }
    return rxCollectionData(query(this.getGroupCollectionRef(), where('id', 'in', groupIds)));
  }

  searchGroupsByName(name: string, limitResult = 5): Observable<GroupData[]> {
    return rxCollectionData(
      query(
        this.getGroupCollectionRef(),
        where('nameLowerCase', '>=', name.toLocaleLowerCase()),
        where('nameLowerCase', '<=', name.toLowerCase() + '\uf8ff'),
        limit(limitResult),
      ),
    );
  }

  getGroupByName(name: string): Observable<GroupData | undefined> {
    return rxCollectionData(query(this.getGroupCollectionRef(), where('nameLowerCase', '==', name.toUpperCase()))).pipe(
      map((data) => data[0]),
    );
  }

  getGroupHoldingsDataById(groupId: string): Observable<PortfolioStateHolding[]> {
    return this.getGroupHoldingSnapshotsDataById(groupId).pipe(
      switchMap((groupHoldings) =>
        !groupHoldings
          ? of([])
          : this.marketApiService.getSymbolQuotes(groupHoldings.data?.map((h) => h.symbol)).pipe(
              map((symbolQuotes) =>
                groupHoldings.data.map(
                  (holding) =>
                    ({
                      ...holding,
                      symbolQuote: symbolQuotes.find((s) => s.symbol === holding.symbol)!,
                      breakEvenPrice: roundNDigits(holding.invested / holding.units, 6),
                      weight: roundNDigits(holding.invested / holding.invested, 6),
                    }) satisfies PortfolioStateHolding,
                ),
              ),
            ),
      ),
    );
  }

  getGroupDetailsById(groupId: string): Observable<GroupDetails | null> {
    return combineLatest([
      this.getGroupDataById(groupId),
      this.getGroupMembersDataById(groupId),
      this.getGroupPortfolioTransactionsDataById(groupId),
      this.getGroupPortfolioSnapshotsDataById(groupId),
    ]).pipe(
      map(([groupData, groupMembersData, groupTransactionsData, groupPortfolioSnapshotsData]) => {
        if (!groupData || !groupMembersData) {
          throw new Error('Group data not found');
        }

        // helper function to merge transactions with user data
        const groupTransform = (dataT: PortfolioTransaction[]): PortfolioTransactionMore[] =>
          dataT.map((transaction) => {
            const user = groupMembersData.data.find((m) => m.id === transaction.userId);
            return {
              ...transaction,
              userDisplayName: user?.personal.displayName,
              userPhotoURL: user?.personal.photoURL,
              userDisplayNameInitials: user?.personal.displayNameInitials,
            } satisfies PortfolioTransactionMore;
          });

        // merge transactions with user data
        const portfolioTransactionsMore = groupTransform(groupTransactionsData?.data ?? []);
        const portfolioTransactionsBest = groupTransform(groupTransactionsData?.transactionBestReturn ?? []);
        const portfolioTransactionsWorst = groupTransform(groupTransactionsData?.transactionsWorstReturn ?? []);

        return {
          groupData,
          groupMembersData: groupMembersData.data ?? [],
          groupTransactionsData: portfolioTransactionsMore,
          groupPortfolioSnapshotsData: groupPortfolioSnapshotsData?.data ?? [],
          groupTransactionsDataBest: portfolioTransactionsBest,
          groupTransactionsDataWorst: portfolioTransactionsWorst,
        } satisfies GroupDetails;
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      }),
    );
  }

  async createGroup(userData: UserData, input: GroupCreateInput): Promise<GroupData> {
    const userBase = transformUserToBase(userData);
    const groupMembers = transformUserToGroupMember(userData, 1);
    const group = await lastValueFrom(this.getGroupByName(input.groupName).pipe(take(1)));

    // check if group already exists
    if (group) {
      throw new Error(GROUP_SAME_NAME_ERROR);
    }

    // demo account can not be added to the group
    if (userData.isDemo) {
      throw new Error(USER_HAS_DEMO_ACCOUNT_ERROR);
    }

    // if no permission allow only the limit of groups
    if (!userData.featureAccess?.createGroups && userData.groups.groupOwner.length >= GROUP_OWNER_LIMIT) {
      throw new Error(GROUP_OWNER_LIMIT_ERROR);
    }

    // create group
    const newGroup = this.createGroupData(input, userBase);

    const batch = writeBatch(this.firestore);

    // save new group
    batch.set(this.getGroupDocRef(newGroup.id), newGroup);

    // create additional documents for group
    batch.set(this.getGroupPortfolioTransactionDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
      transactionBestReturn: [],
      transactionsWorstReturn: [],
    });

    // create members collection
    batch.set(this.getGroupMembersDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [groupMembers],
    });

    // create portfolio snapshots collection
    batch.set(this.getGroupPortfolioSnapshotsDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    });

    // create holding snapshots collection
    batch.set(this.getGroupHoldingSnapshotsDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    });

    // update owner's data
    batch.update(this.userApiService.getUserDocRef(userData.id), {
      groups: {
        ...userData.groups,
        groupOwner: [...userData.groups.groupOwner, newGroup.id],
        groupMember: [...userData.groups.groupMember, newGroup.id],
      },
    } satisfies Partial<UserData>);

    // commit batch
    await batch.commit();

    return newGroup;
  }

  /**
   * resets historical transactions, portfolio snapshots, holding snapshots, and other group data
   * such that group can start fresh with members it has
   */
  resetGroupData(groupId: string): void {
    // reset portfolio snapshots
    setDoc(this.getGroupPortfolioSnapshotsDocRef(groupId), {
      data: [],
      lastModifiedDate: getCurrentDateDefaultFormat(),
    });

    // reset transactions
    setDoc(this.getGroupPortfolioTransactionDocRef(groupId), {
      data: [],
      lastModifiedDate: getCurrentDateDefaultFormat(),
      transactionBestReturn: [],
      transactionsWorstReturn: [],
    });

    // reset holding snapshots
    setDoc(this.getGroupHoldingSnapshotsDocRef(groupId), {
      data: [],
      lastModifiedDate: getCurrentDateDefaultFormat(),
    });

    // reset portfolio state
    updateDoc(this.getGroupDocRef(groupId), {
      portfolioState: {
        ...createEmptyPortfolioState(),
      },
    } satisfies Partial<GroupData>);
  }

  closeGroup(groupId: string) {
    updateDoc(this.getGroupDocRef(groupId), {
      isClosed: true,
    } satisfies Partial<GroupData>);

    const callable = httpsCallable<GroupGeneralActions, GroupData>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'closeGroup',
      groupId: groupId,
    });
  }

  reopenGroup(groupId: string): void {
    updateDoc(this.getGroupDocRef(groupId), {
      isClosed: false,
      endDate: null,
    } satisfies Partial<GroupData>);
  }

  deleteGroup(groupId: string) {
    const callable = httpsCallable<GroupGeneralActions, GroupData>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'deleteGroup',
      groupId: groupId,
    });
  }

  userAcceptsGroupInvitation(groupId: string) {
    const callable = httpsCallable<GroupGeneralActions, void>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'inviteUsersAccept',
      groupId,
    });
  }

  userDeclinesGroupInvitation(input: { groupId: string; userId: string }) {
    const callable = httpsCallable<GroupGeneralActions, GroupData>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'inviteUserRemoveInvitation',
      userId: input.userId,
      groupId: input.groupId,
    });
  }

  changeGroupSettings(input: GroupSettingsChangeInput): void {
    updateDoc(this.getGroupDocRef(input.groupId), {
      name: input.groupName,
      nameLowerCase: input.groupName.toLowerCase(),
      isPublic: input.isPublic,
      imageUrl: input.imageUrl,
    } satisfies Partial<GroupData>);
  }

  removeGroupMembers(input: { groupId: string; userIds: string[] }) {
    const callable = httpsCallable<GroupGeneralActions, GroupData>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'membersRemove',
      userIds: input.userIds,
      groupId: input.groupId,
    });
  }

  /**
   *
   * @param input
   * @returns - how many users were invited to the group who are not yet members or invited or requested
   */
  inviteUsersToGroup(input: { groupId: string; userIds: string[] }) {
    const callable = httpsCallable<GroupGeneralActions, number>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'inviteUsers',
      userIds: input.userIds,
      groupId: input.groupId,
    });
  }

  addOwnerOfGroupIntoGroup(userData: UserData, groupData: GroupData): void {
    // update group
    updateDoc(this.getGroupDocRef(groupData.id), {
      memberUserIds: [...groupData.memberUserIds, userData.id],
    } satisfies Partial<GroupData>);

    // update group member data
    updateDoc(this.getGroupMembersDocRef(groupData.id), {
      data: arrayUnion(transformUserToGroupMember(userData, groupData.memberUserIds.length + 1)),
    });

    // update user
    this.userApiService.updateUser(userData.id, {
      groups: {
        ...userData.groups,
        groupMember: [...userData.groups.groupMember, groupData.id],
      },
    });
  }

  inviteUserToGroup(input: { groupId: string; userId: string }) {
    const callable = httpsCallable<GroupGeneralActions, GroupData>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'inviteUsers',
      userIds: [input.userId],
      groupId: input.groupId,
    });
  }

  /**
   * Removes user invitation to join group
   *
   * @param input
   * @returns
   */
  removeUserInvitationToGroup(input: { groupId: string; userId: string }) {
    const callable = httpsCallable<GroupGeneralActions, void>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'inviteUserRemoveInvitation',
      groupId: input.groupId,
      userId: input.userId,
    });
  }

  /**
   * Removes existing group member
   *
   * @param input
   */
  leaveGroup(groupId: string) {
    const callable = httpsCallable<GroupGeneralActions, void>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'leaveGroup',
      groupId,
    });
  }

  /**
   * Accepts user request to join group
   *
   * @param input
   * @returns
   */
  acceptUserRequestToGroup(input: { groupId: string; userId: string }) {
    const callable = httpsCallable<GroupGeneralActions, void>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'requestMembershipAccept',
      groupId: input.groupId,
      userId: input.userId,
    });
  }

  /**
   * Declines user request to join group
   *
   * @param input
   * @returns
   */
  declineUserRequestToGroup(input: { groupId: string; userId: string }) {
    const callable = httpsCallable<GroupGeneralActions, void>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'requestMembershipDecline',
      groupId: input.groupId,
      userId: input.userId,
    });
  }

  sendRequestToJoinGroup(groupId: string) {
    const callable = httpsCallable<GroupGeneralActions, void>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'requestMembership',
      groupId: groupId,
    });
  }

  removeRequestToJoinGroup(input: { groupId: string; userId: string }) {
    const callable = httpsCallable<GroupGeneralActions, void>(this.functions, 'groupGeneralActionsCall');
    return callable({
      type: 'requestMembershipDecline',
      groupId: input.groupId,
      userId: input.userId,
    });
  }

  private getGroupDocRef(groupId: string): DocumentReference<GroupData> {
    return doc(this.getGroupCollectionRef(), groupId);
  }

  private getGroupCollectionRef(): CollectionReference<GroupData, DocumentData> {
    return collection(this.firestore, 'groups').withConverter(assignTypesClient<GroupData>());
  }

  private getGroupCollectionMoreInformationRef(userId: string): CollectionReference<DocumentData, DocumentData> {
    return collection(doc(this.getGroupCollectionRef(), userId), 'more_information');
  }

  private getGroupPortfolioTransactionDocRef(userId: string): DocumentReference<GroupTransactionsData> {
    return doc(this.getGroupCollectionMoreInformationRef(userId), 'transactions').withConverter(
      assignTypesClient<GroupTransactionsData>(),
    );
  }

  private getGroupPortfolioSnapshotsDocRef(userId: string): DocumentReference<GroupPortfolioStateSnapshotsData> {
    return doc(this.getGroupCollectionMoreInformationRef(userId), 'portfolio_snapshots').withConverter(
      assignTypesClient<GroupPortfolioStateSnapshotsData>(),
    );
  }

  private getGroupHoldingSnapshotsDocRef(userId: string): DocumentReference<GroupHoldingSnapshotsData> {
    return doc(this.getGroupCollectionMoreInformationRef(userId), 'holding_snapshots').withConverter(
      assignTypesClient<GroupHoldingSnapshotsData>(),
    );
  }

  private getGroupMembersDocRef(userId: string): DocumentReference<GroupMembersData> {
    return doc(this.getGroupCollectionMoreInformationRef(userId), 'members').withConverter(
      assignTypesClient<GroupMembersData>(),
    );
  }

  /**
   *
   * @param data - basic information about the group
   * @param owner - who the group belongs to
   * @param isOwnerMember - is the owner a member of the group or not
   * @param isDemo - if true, group is for demo purposes
   * @returns created group
   */
  private createGroupData(data: GroupCreateInput, owner: UserBase, isOwnerMember = false): GroupData {
    return {
      id: uuidv4(),
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
      memberUserIds: isOwnerMember ? [owner.id] : [],
      endDate: null,
      modifiedSubCollectionDate: getYesterdaysDate(),
      portfolioState: {
        ...createEmptyPortfolioState(),
      },
      systemRank: {},
      numberOfMembers: 1,
    };
  }
}
