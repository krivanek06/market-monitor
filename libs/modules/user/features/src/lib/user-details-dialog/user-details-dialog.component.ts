import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupApiService, UserApiService } from '@market-monitor/api-client';
import { GroupData, PortfolioGrowthAssets, PortfolioStateHoldings, UserData } from '@market-monitor/api-types';
import { PortfolioCalculationService, PortfolioGrowthService } from '@market-monitor/modules/portfolio/data-access';
import { PortfolioGrowthChartsComponent } from '@market-monitor/modules/portfolio/features';
import {
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import { DialogServiceUtil, filterNullish } from '@market-monitor/shared/utils-client';
import { forkJoin, from, map, share, switchMap, tap } from 'rxjs';

export type UserDetailsDialogComponentData = {
  userId: string;
};

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    DefaultImgDirective,
    MatProgressSpinnerModule,
    PortfolioStateComponent,
    PortfolioStateRiskComponent,
    PortfolioStateTransactionsComponent,
    PortfolioGrowthChartsComponent,
  ],
  templateUrl: './user-details-dialog.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsDialogComponent {
  private userApiService = inject(UserApiService);
  private groupApiService = inject(GroupApiService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private portfolioGrowthService = inject(PortfolioGrowthService);
  private portfolioCalculationService = inject(PortfolioCalculationService);

  userDataSignal = signal<UserData | undefined>(undefined);
  userGroupDataSignal = signal<{
    groupOwner: GroupData[];
    groupMember: GroupData[];
  }>({
    groupMember: [],
    groupOwner: [],
  });
  portfolioStateHoldingSignal = signal<PortfolioStateHoldings | undefined>(undefined);
  portfolioGrowthAssetsSignal = signal<PortfolioGrowthAssets[]>([]);
  portfolioGrowthSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioGrowth(
      this.portfolioGrowthAssetsSignal(),
      this.userDataSignal()?.portfolioState?.startingCash,
    ),
  );

  ColorScheme = ColorScheme;

  constructor(
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailsDialogComponentData,
  ) {
    const userRef$ = this.userApiService.getUsersById(this.data.userId).pipe(
      tap((userData) => {
        if (!userData) {
          this.dialogServiceUtil.showNotificationBar(`User not found`, 'error');
          this.onDialogClose();
        }
      }),
      filterNullish(),
      share(),
    );

    const userPortfolioTransactions$ = userRef$.pipe(
      switchMap((userData) =>
        this.userApiService
          .getUserPortfolioTransactions(userData.id)
          .pipe(map((transactions) => ({ userData, transactions: transactions.transactions }))),
      ),
      share(),
    );

    // load user data
    userRef$.subscribe((userData) => {
      this.userDataSignal.set(userData);
    });

    // load user group data
    userRef$
      .pipe(
        switchMap((userData) =>
          forkJoin([
            this.groupApiService.getGroupDataByIds(userData.groups.groupOwner),
            this.groupApiService.getGroupDataByIds(userData.groups.groupMember),
          ]),
        ),
      )
      .subscribe(([groupOwner, groupMember]) =>
        this.userGroupDataSignal.set({
          groupMember,
          groupOwner,
        }),
      );

    // load user portfolio state
    userPortfolioTransactions$
      .pipe(
        switchMap((data) =>
          this.portfolioGrowthService.getPortfolioStateHoldings(
            data.transactions,
            data.userData.portfolioState.startingCash,
          ),
        ),
      )
      .subscribe((portfolioState) => this.portfolioStateHoldingSignal.set(portfolioState));

    userPortfolioTransactions$
      .pipe(switchMap((data) => from(this.portfolioGrowthService.getPortfolioGrowthAssets(data.transactions))))
      .subscribe((portfolioGrowthAssets) => this.portfolioGrowthAssetsSignal.set(portfolioGrowthAssets));
  }

  onDialogClose() {
    this.dialogRef.close();
  }
}
