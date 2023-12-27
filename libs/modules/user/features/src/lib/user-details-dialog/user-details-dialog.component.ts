import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupApiService, UserApiService } from '@market-monitor/api-client';
import { GroupData, PortfolioGrowthAssets, PortfolioStateHoldings, UserData } from '@market-monitor/api-types';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioCalculationService, PortfolioGrowthService } from '@market-monitor/modules/portfolio/data-access';
import { LabelValue } from '@market-monitor/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { DefaultImgDirective, TabSelectControlComponent } from '@market-monitor/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { forkJoin, from, map, share, switchMap, tap } from 'rxjs';
import { UserDetailsHoldingsComponent } from './user-details-holdings/user-details-holdings.component';
import { UserDetailsOverviewComponent } from './user-details-overview/user-details-overview.component';

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
    UserDetailsOverviewComponent,
    TabSelectControlComponent,
    ReactiveFormsModule,
    UserDetailsHoldingsComponent,
    StockSummaryDialogComponent,
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
  private dialog = inject(MatDialog);

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

  selectedTabControl = new FormControl<'overview' | 'holdings'>('overview');
  displayOptions: LabelValue<'overview' | 'holdings'>[] = [
    { label: 'Overview', value: 'overview' },
    { label: 'Holdings', value: 'holdings' },
  ];

  constructor(
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailsDialogComponentData,
  ) {
    const userRef$ = this.userApiService.getUserById(this.data.userId).pipe(
      tap((userData) => {
        if (!userData) {
          this.dialogServiceUtil.showNotificationBar(`User not found`, 'error');
          this.onDialogClose();
        }
      }),
      filterNil(),
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

  onSummaryClick(symbol: string) {
    // close current dialog
    this.onDialogClose();

    // open new dialog
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onDialogClose() {
    this.dialogRef.close();
  }
}
