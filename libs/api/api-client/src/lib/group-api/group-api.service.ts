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
import { GroupBaseInput, GroupCreateInput, GroupData } from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { getApp } from 'firebase/app';
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

  async sendRequestToJoinGroup(input: GroupBaseInput): Promise<GroupData> {
    const callable = httpsCallable<GroupBaseInput, GroupData>(this.functions, 'groupRequestMembershipCall');
    const result = await callable(input);
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
}
