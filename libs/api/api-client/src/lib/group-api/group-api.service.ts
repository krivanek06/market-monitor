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
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { faker } from '@faker-js/faker';
import {
  GROUP_OWNER_LIMIT,
  GROUP_OWNER_LIMIT_ERROR,
  GROUP_SAME_NAME_ERROR,
  GroupBaseInput,
  GroupBaseInputInviteMembers,
  GroupCreateInput,
  GroupData,
  GroupDetails,
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
import { limit } from 'firebase/firestore';
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
  private functions = inject(Functions);
  private firestore = inject(Firestore);
  private marketApiService = inject(MarketApiService);
  private userApiService = inject(UserApiService);

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
        where('nameLowerCase', '>=', name.toUpperCase()),
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

    // check limit
    if (userData.groups.groupOwner.length >= GROUP_OWNER_LIMIT) {
      throw new Error(GROUP_OWNER_LIMIT_ERROR);
    }

    // create group
    const newGroup = this.createGroupData(input, userBase);

    // save new group
    setDoc(this.getGroupDocRef(newGroup.id), newGroup);

    // create additional documents for group
    setDoc(this.getGroupPortfolioTransactionDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
      transactionBestReturn: [],
      transactionsWorstReturn: [],
    });

    // create members collection
    setDoc(this.getGroupMembersDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [groupMembers],
    });

    // create portfolio snapshots collection
    setDoc(this.getGroupPortfolioSnapshotsDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    });

    // create holding snapshots collection
    setDoc(this.getGroupHoldingSnapshotsDocRef(newGroup.id), {
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: [],
    });

    // update owner's data
    this.userApiService.updateUser(userData.id, {
      groups: {
        ...userData.groups,
        groupOwner: [...userData.groups.groupOwner, newGroup.id],
        groupMember: [...userData.groups.groupMember, newGroup.id],
      },
    });

    return newGroup;
  }

  async closeGroup(input: string): Promise<GroupData> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupCloseCall');
    const result = await callable(input);
    return result.data;
  }

  reopenGroup(groupId: string): Promise<void> {
    return updateDoc(this.getGroupDocRef(groupId), {
      isClosed: false,
      endDate: null,
    } satisfies Partial<GroupData>);
  }

  async deleteGroup(input: string): Promise<GroupData> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupDeleteCall');
    const result = await callable(input);
    return result.data;
  }

  async userAcceptsGroupInvitation(input: string): Promise<void> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupMemberAcceptCall');
    await callable(input);
  }

  async userDeclinesGroupInvitation(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberInviteRemoveCall');
    await callable(input);
  }

  async changeGroupSettings(input: GroupSettingsChangeInput): Promise<void> {
    const callable = httpsCallable<GroupSettingsChangeInput, GroupData>(this.functions, 'groupSettingsChangeCall');
    await callable(input);
  }

  /**
   *
   * @param input
   * @returns - how many users were invited to the group who are not yet members or invited or requested
   */
  async inviteUsersToGroup(input: GroupBaseInputInviteMembers): Promise<number> {
    const callable = httpsCallable<GroupBaseInputInviteMembers, number>(
      this.functions,
      'groupMemberInviteMultipleCall',
    );
    const result = await callable(input);
    return result.data;
  }

  async addOwnerOfGroupIntoGroup(groupId: string): Promise<void> {
    const callable = httpsCallable<string, void>(this.functions, 'groupAddOwnerIntoGroupCall');
    await callable(groupId);
  }

  async inviteUserToGroup(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberInviteCall');
    await callable(input);
  }

  /**
   * Removes user invitation to join group
   *
   * @param input
   * @returns
   */
  async removeUserInvitationToGroup(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, void>(this.functions, 'groupMemberInviteRemoveCall');
    await callable(input);
  }

  /**
   * Removes existing group member
   *
   * @param input
   */
  async removeGroupMember(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberRemoveCall');
    await callable(input);
  }

  /**
   * Accepts user request to join group
   *
   * @param input
   * @returns
   */
  async acceptUserRequestToGroup(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, void>(this.functions, 'groupRequestMembershipAcceptCall');
    await callable(input);
  }

  /**
   * Declines user request to join group
   *
   * @param input
   * @returns
   */
  async declineUserRequestToGroup(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, void>(this.functions, 'groupRequestMembershipRemoveCall');
    await callable(input);
  }

  async sendRequestToJoinGroup(groupId: string): Promise<void> {
    const callable = httpsCallable<string, void>(this.functions, 'groupRequestMembershipCall');
    await callable(groupId);
  }

  async removeRequestToJoinGroup(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, void>(this.functions, 'groupRequestMembershipRemoveCall');
    await callable(input);
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
