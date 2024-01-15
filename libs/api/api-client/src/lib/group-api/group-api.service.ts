import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  collection,
  doc,
  query,
  where,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import {
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
  PortfolioTransactionMore,
} from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/data-access';
import { roundNDigits } from '@market-monitor/shared/features/general-util';
import { limit } from 'firebase/firestore';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { MarketApiService } from '../market-api/market-api.service';

@Injectable({
  providedIn: 'root',
})
export class GroupApiService {
  private functions = inject(Functions);
  private firestore = inject(Firestore);
  private marketApiService = inject(MarketApiService);

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

  getGroupByName(name: string, limitResult = 5): Observable<GroupData[]> {
    return rxCollectionData(
      query(
        this.getGroupCollectionRef(),
        where('name', '>=', name.toUpperCase()),
        where('name', '<=', name.toLowerCase()),
        limit(limitResult),
      ),
    );
  }

  getGroupDetailsById(groupId: string): Observable<GroupDetails> {
    return combineLatest([
      this.getGroupDataById(groupId),
      this.getGroupMembersDataById(groupId),
      this.getGroupPortfolioTransactionsDataById(groupId),
      this.getGroupPortfolioSnapshotsDataById(groupId),
      this.getGroupHoldingSnapshotsDataById(groupId).pipe(
        switchMap((groupHoldings) =>
          this.marketApiService.getSymbolSummaries(groupHoldings?.data?.map((h) => h.symbol)).pipe(
            map(
              (symbolSummaries) =>
                groupHoldings?.data.map(
                  (holding) =>
                    ({
                      ...holding,
                      symbolSummary: symbolSummaries.find((s) => s.id === holding.symbol)!,
                      breakEvenPrice: roundNDigits(holding.invested / holding.units),
                    }) satisfies PortfolioStateHolding,
                ),
            ),
          ),
        ),
      ),
    ]).pipe(
      map(
        ([
          groupData,
          groupMembersData,
          groupTransactionsData,
          groupPortfolioSnapshotsData,
          groupHoldingSnapshotsData,
        ]) => {
          if (!groupData || !groupMembersData) {
            throw new Error('Group data not found');
          }

          // merge transactions with user data
          const portfolioTransactionsMore = (groupTransactionsData?.data ?? []).map(
            (transaction) =>
              ({
                ...transaction,
                userDisplayName: groupMembersData.data.find((m) => m.id === transaction.userId)?.personal.displayName,
                userPhotoURL: groupMembersData.data.find((m) => m.id === transaction.userId)?.personal.photoURL,
              }) satisfies PortfolioTransactionMore,
          );

          return {
            groupData,
            groupMembersData: groupMembersData.data ?? [],
            groupTransactionsData: portfolioTransactionsMore,
            groupPortfolioSnapshotsData: groupPortfolioSnapshotsData?.data ?? [],
            groupHoldingSnapshotsData: groupHoldingSnapshotsData ?? [],
          } satisfies GroupDetails;
        },
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

  async reopenGroup(input: string): Promise<GroupData> {
    const callable = httpsCallable<string, GroupData>(this.functions, 'groupReopenCall');
    const result = await callable(input);
    return result.data;
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
}
