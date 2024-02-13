import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserApiService } from '@market-monitor/api-client';
import { PortfolioGrowthAssets, PortfolioStateHoldings, UserData } from '@market-monitor/api-types';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioCalculationService, PortfolioGrowthService } from '@market-monitor/modules/portfolio/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { from, map, share, switchMap, tap } from 'rxjs';
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
    StockSummaryDialogComponent,
  ],
  template: `
    <div class="flex items-center justify-between p-4">
      <!-- display user -->
      <div *ngIf="userDataSignal() as user" class="flex items-center gap-2">
        <img appDefaultImg [src]="user.personal.photoURL" alt="User Image" class="rounded-full w-14 h-14" />
        <div class="flex flex-col">
          <span class="text-xl">{{ user.personal.displayName }}</span>
          <span class="text-sm">{{ user.accountCreatedDate | date: 'MMMM d, y' }}</span>
        </div>
      </div>

      <!-- close -->
      <div>
        <button mat-icon-button color="warn" type="button" (click)="onDialogClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>

    <mat-dialog-content class="md:h-[675px]">
      @if (userDataSignal(); as userData) {
        <app-user-details-overview
          [userData]="userData"
          [portfolioGrowth]="portfolioGrowthSignal()"
          [holdings]="portfolioStateHoldingSignal()"
        ></app-user-details-overview>
      } @else {
        <mat-spinner></mat-spinner>
      }
    </mat-dialog-content>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsDialogComponent {
  private userApiService = inject(UserApiService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  private portfolioGrowthService = inject(PortfolioGrowthService);
  private portfolioCalculationService = inject(PortfolioCalculationService);
  private dialog = inject(MatDialog);

  userDataSignal = signal<UserData | undefined>(undefined);
  portfolioStateHoldingSignal = signal<PortfolioStateHoldings | undefined>(undefined);
  portfolioGrowthAssetsSignal = signal<PortfolioGrowthAssets[]>([]);
  portfolioGrowthSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioGrowth(
      this.portfolioGrowthAssetsSignal(),
      this.userDataSignal()?.portfolioState?.startingCash,
    ),
  );

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

    // load user portfolio state
    userPortfolioTransactions$
      .pipe(
        switchMap((data) =>
          this.portfolioGrowthService.getPortfolioStateHoldings(data.transactions, data.userData.portfolioState),
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
