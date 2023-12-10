import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  collection,
  doc,
  query,
  where,
} from '@angular/fire/firestore';
import { httpsCallable } from '@angular/fire/functions';
import {
  GroupBaseInput,
  GroupBaseInputInviteMembers,
  GroupCreateInput,
  GroupData,
  GroupHoldingSnapshotsData,
  GroupMembersData,
  GroupPortfolioStateSnapshotsData,
  GroupTransactionsData,
} from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { getApp } from 'firebase/app';
import { limit } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupApiService {
  private functions = getFunctions(getApp());

  constructor(private firestore: Firestore) {}

  getGroupDataById(groupId: string): Observable<GroupData | undefined> {
    return rxDocData(this.getGroupDocRef(groupId), { idField: 'id' });
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

  getGroupByName(name: string, limitResult = 5): Observable<GroupData[]> {
    return rxCollectionData(
      query(
        this.getGroupCollectionRef(),
        where('name', '>=', name),
        where('name', '<=', name + '\uf8ff'),
        limit(limitResult),
      ),
    );
  }

  async createGroup(input: GroupCreateInput): Promise<GroupData> {
    const callable = httpsCallable<GroupCreateInput, GroupData>(this.functions, 'groupCreateCall');
    const result = await callable(input);
    return result.data;
  }

  async closeGroup(input: string): Promise<GroupData> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupCloseCall');
    const result = await callable(input);
    return result.data;
  }

  async deleteGroup(input: string): Promise<GroupData> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupDeleteCall');
    const result = await callable(input);
    return result.data;
  }

  async userAcceptsGroupInvitation(input: string): Promise<GroupData> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupMemberAcceptCall');
    const result = await callable(input);
    return result.data;
  }

  async userDeclinesGroupInvitation(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberInviteRemoveCall');
    const result = await callable(input);
    return result.data;
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

  async inviteUserToGroup(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberInviteCall');
    const result = await callable(input);
    return result.data;
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

  async removeGroupMember(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberRemoveCall');
    const result = await callable(input);
    return result.data;
  }

  /**
   * Accepts user request to join group
   *
   * @param input
   * @returns
   */
  async acceptUserRequestToGroup(input: GroupBaseInput): Promise<void> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupRequestMembershipAcceptCall');
    await callable(input);
  }

  /**
   * Declines user request to join group
   *
   * @param input
   * @returns
   */
  async declineUserRequestToGroup(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupRequestMembershipRemoveCall');
    const result = await callable(input);
    return result.data;
  }

  async sendRequestToJoinGroup(groupId: string): Promise<GroupData> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupRequestMembershipCall');
    const result = await callable(groupId);
    return result.data;
  }

  async removeRequestToJoinGroup(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupRequestMembershipRemoveCall');
    const result = await callable(input);
    return result.data;
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
}
