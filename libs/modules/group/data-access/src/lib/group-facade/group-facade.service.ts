import { Injectable } from '@angular/core';
import { GroupApiService, MarketApiService } from '@market-monitor/api-client';
import { GroupDetails, PortfolioStateHolding, PortfolioTransactionMore } from '@market-monitor/api-types';
import { roundNDigits } from '@market-monitor/shared/utils-general';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupFacadeService {
  constructor(
    private groupApiService: GroupApiService,
    private marketApiService: MarketApiService,
  ) {}

  getGroupDetailsById(groupId: string): Observable<GroupDetails> {
    return combineLatest([
      this.groupApiService.getGroupDataById(groupId),
      this.groupApiService.getGroupMembersDataById(groupId),
      this.groupApiService.getGroupPortfolioTransactionsDataById(groupId),
      this.groupApiService.getGroupPortfolioSnapshotsDataById(groupId),
      this.groupApiService.getGroupHoldingSnapshotsDataById(groupId).pipe(
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
}
