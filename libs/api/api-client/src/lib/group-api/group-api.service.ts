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
  GroupDetails,
  GroupMembersData,
  GroupTransactionsData,
} from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { getApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { Observable, combineLatest, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupApiService {
  private functions = getFunctions(getApp());

  constructor(private firestore: Firestore) {}

  getGroupDetailsById(groupId: string): Observable<GroupDetails | undefined> {
    return combineLatest([
      this.getGroupDataById(groupId),
      this.getGroupMembersDataById(groupId),
      this.getGroupPortfolioTransactionsDataById(groupId),
    ]).pipe(
      map(([groupData, groupMembersData, groupTransactionData]) => {
        if (!groupData || !groupMembersData || !groupTransactionData) {
          return undefined;
        }
        return {
          groupData: groupData,
          groupMembersData: groupMembersData,
          groupTransactionsData: groupTransactionData,
        } as GroupDetails;
      }),
    );
  }

  getGroupDataById(groupId: string): Observable<GroupData | undefined> {
    return rxDocData(this.getGroupDocRef(groupId), { idField: 'id' });
  }

  getGroupMembersDataById(groupId: string): Observable<GroupMembersData | undefined> {
    return rxDocData(this.getGroupMembersDocRef(groupId));
  }

  getGroupPortfolioTransactionsDataById(groupId: string): Observable<GroupTransactionsData | undefined> {
    return rxDocData(this.getGroupPortfolioTransactionDocRef(groupId));
  }

  getGroupsDataByIds(groupIds: string[]): Observable<GroupData[]> {
    if (groupIds.length === 0) {
      return of([]);
    }
    return rxCollectionData(query(this.getGroupCollectionRef(), where('id', 'in', groupIds)));
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

  async removeUserInvitationToGroup(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberInviteRemoveCall');
    const result = await callable(input);
    return result.data;
  }

  async removeGroupMember(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupMemberRemoveCall');
    const result = await callable(input);
    return result.data;
  }

  async acceptUserRequestToGroup(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupRequestMembershipAcceptCall');
    const result = await callable(input);
    return result.data;
  }

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

  private getGroupMembersDocRef(userId: string): DocumentReference<GroupMembersData> {
    return doc(this.getGroupCollectionMoreInformationRef(userId), 'members').withConverter(
      assignTypesClient<GroupMembersData>(),
    );
  }
}
