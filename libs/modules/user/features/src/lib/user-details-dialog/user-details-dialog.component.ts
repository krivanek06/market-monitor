import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserApiService } from '@market-monitor/api-client';
import { PortfolioGrowthAssets, PortfolioStateHoldings, UserData } from '@market-monitor/api-types';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioCalculationService, PortfolioGrowthService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import { DefaultImgDirective, GenericChartComponent, SectionTitleComponent } from '@market-monitor/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { from, map, share, switchMap, tap } from 'rxjs';

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
    StockSummaryDialogComponent,
    SectionTitleComponent,
    PortfolioHoldingsTableComponent,
    GenericChartComponent,
    PortfolioStateTransactionsComponent,
    PortfolioStateRiskComponent,
    PortfolioStateComponent,
    PortfolioGrowthChartComponent,
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
        <div class="pb-2">
          <mat-divider></mat-divider>
        </div>
        <!-- display portfolio -->
        <div class="flex p-2 divide-x-2 flex-row">
          <!-- portfolio state -->
          <div class="p-2 max-lg:flex-1 lg:basis-[40%]">
            <app-portfolio-state
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [portfolioState]="portfolioStateHoldingSignal()"
              [showCashSegment]="!!userData.features.allowPortfolioCashAccount"
            ></app-portfolio-state>
          </div>
          <!-- risk -->
          <div class="p-2 flex-1 hidden md:block">
            <app-portfolio-state-risk
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [portfolioState]="portfolioStateHoldingSignal()"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            ></app-portfolio-state-risk>
          </div>
          <!-- transactions -->
          <div class="p-2 flex-1 hidden lg:block">
            <app-portfolio-state-transactions
              [portfolioState]="portfolioStateHoldingSignal()"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showFees]="!!userData.features.allowPortfolioCashAccount"
            >
            </app-portfolio-state-transactions>
          </div>
        </div>

        <div class="py-2 max-md:mb-2">
          <mat-divider></mat-divider>
        </div>

        <!-- portfolio growth charts -->
        @if (portfolioGrowthSignal(); as portfolioGrowth) {
          <app-portfolio-growth-chart
            headerTitle="Portfolio Growth"
            chartType="balance"
            [displayHeader]="true"
            [displayLegend]="true"
            [data]="{
              values: portfolioGrowth,
              startingCashValue: userData.portfolioState.startingCash
            }"
            [heightPx]="375"
            class="mb-6"
          ></app-portfolio-growth-chart>
        } @else {
          <div class="h-[375px] grid place-content-center">
            <mat-spinner></mat-spinner>
          </div>
        }

        <div class="max-sm:pl-2 mb-6">
          <app-section-title [title]="'Holdings: ' + (portfolioStateHoldingSignal()?.holdings ?? []).length" />
          <app-portfolio-holdings-table
            [holdings]="portfolioStateHoldingSignal()?.holdings ?? []"
            [holdingsBalance]="portfolioStateHoldingSignal()?.holdingsBalance ?? 0"
            [displayedColumns]="displayedColumns"
          ></app-portfolio-holdings-table>
        </div>
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

  userDataSignal = signal<UserData | undefined>(undefined);
  portfolioStateHoldingSignal = signal<PortfolioStateHoldings | undefined>(undefined);
  portfolioGrowthAssetsSignal = signal<PortfolioGrowthAssets[] | null>(null);
  portfolioGrowthSignal = computed(() => {
    const growth = this.portfolioGrowthAssetsSignal();

    return growth
      ? this.portfolioCalculationService.getPortfolioGrowth(growth, this.userDataSignal()?.portfolioState?.startingCash)
      : null;
  });

  ColorScheme = ColorScheme;
  displayedColumns: string[] = ['symbol', 'price', 'balance', 'invested', 'totalChange', 'portfolio', 'marketCap'];

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
