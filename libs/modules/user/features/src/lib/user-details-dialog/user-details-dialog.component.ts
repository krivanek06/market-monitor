import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserApiService } from '@mm/api-client';
import { PortfolioGrowthAssets, PortfolioStateHoldings, PortfolioTransaction, UserData } from '@mm/api-types';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
import {
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@mm/portfolio/ui';
import { ColorScheme, LabelValue } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, SectionTitleComponent, TabSelectControlComponent } from '@mm/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { from, map, share, switchMap, tap } from 'rxjs';
import { UserDetailsPortfolioComponent } from './user-details-portfolio/user-details-portfolio.component';
import { UserDetailsTransactionsComponent } from './user-details-transactions/user-details-transactions.component';

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
    SectionTitleComponent,
    PortfolioStateTransactionsComponent,
    PortfolioStateRiskComponent,
    PortfolioStateComponent,
    UserDetailsPortfolioComponent,
    UserDetailsTransactionsComponent,
    TabSelectControlComponent,
  ],
  template: `
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-6">
        <!-- display user -->
        <div *ngIf="userDataSignal() as user" class="flex items-center gap-2">
          <img appDefaultImg [src]="user.personal.photoURL" alt="User Image" class="rounded-full w-14 h-14" />
          <div class="flex flex-col">
            <span class="text-xl">{{ user.personal.displayName }}</span>
            <span class="text-sm">{{ user.accountCreatedDate | date: 'MMMM d, y' }}</span>
          </div>
        </div>

        <!-- tabs -->
        <app-tab-select-control
          class="hidden lg:block"
          [displayOptions]="displayOptions"
          [(selectedValueSignal)]="selectedValueSignal"
        />
      </div>

      <!-- close -->
      <div>
        <button mat-icon-button color="warn" type="button" (click)="onDialogClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>

    <mat-dialog-content class="md:h-[75vh]">
      @if (userDataSignal(); as userData) {
        <div class="pb-2">
          <mat-divider></mat-divider>
        </div>
        <!-- display portfolio -->
        <div class="flex p-2 divide-x-2 flex-row divide-wt-border">
          <!-- portfolio state -->
          <div class="p-2 max-lg:flex-1 lg:basis-[40%]">
            @if (portfolioStateHoldingSignal(); as portfolioStateHoldingSignal) {
              <app-portfolio-state
                [titleColor]="ColorScheme.GRAY_DARK_VAR"
                [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
                [portfolioState]="portfolioStateHoldingSignal"
                [showCashSegment]="userData.userAccountType === 'DEMO_TRADING'"
              ></app-portfolio-state>
            } @else {
              <div class="g-skeleton h-[120px]"></div>
            }
          </div>
          <!-- risk -->
          <div class="p-2 flex-1 hidden md:block">
            @if (portfolioStateHoldingSignal()) {
              <app-portfolio-state-risk
                [titleColor]="ColorScheme.GRAY_DARK_VAR"
                [portfolioRisk]="userDataSignal()?.portfolioRisk"
                [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              ></app-portfolio-state-risk>
            } @else {
              <div class="g-skeleton h-[120px]"></div>
            }
          </div>
          <!-- transactions -->
          <div class="p-2 flex-1 hidden lg:block">
            @if (portfolioStateHoldingSignal(); as portfolioStateHoldingSignal) {
              <app-portfolio-state-transactions
                [portfolioState]="portfolioStateHoldingSignal"
                [titleColor]="ColorScheme.GRAY_DARK_VAR"
                [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
                [showFees]="userData.userAccountType === 'DEMO_TRADING'"
              >
              </app-portfolio-state-transactions>
            } @else {
              <div class="g-skeleton h-[120px]"></div>
            }
          </div>
        </div>

        <div class="py-2 max-md:mb-2">
          <mat-divider></mat-divider>
        </div>

        <div class="p-4">
          @if (selectedValueSignal() === 'portfolio') {
            <!-- portfolio growth -->
            <app-user-details-portfolio
              [userData]="userData"
              [portfolioGrowth]="portfolioGrowthSignal()"
              [portfolioStateHolding]="portfolioStateHoldingSignal()"
            />
          } @else if (selectedValueSignal() === 'transactions') {
            <!-- transaction -->
            <div class="pt-3">
              <app-user-details-transactions [portfolioTransaction]="portfolioTransactions() ?? []" />
            </div>
          }
        </div>
      } @else {
        <div class="grid place-content-center h-[400px]">
          <mat-spinner></mat-spinner>
        </div>
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
  private portfolioCalculationService = inject(PortfolioCalculationService);

  userDataSignal = signal<UserData | undefined>(undefined);
  portfolioTransactions = signal<PortfolioTransaction[] | undefined>(undefined);
  portfolioStateHoldingSignal = signal<PortfolioStateHoldings | undefined>(undefined);
  portfolioGrowthAssetsSignal = signal<PortfolioGrowthAssets[] | null>(null);
  portfolioGrowthSignal = computed(() => {
    const growth = this.portfolioGrowthAssetsSignal();

    return growth
      ? this.portfolioCalculationService.getPortfolioGrowth(growth, this.userDataSignal()?.portfolioState?.startingCash)
      : null;
  });
  ColorScheme = ColorScheme;

  displayOptions: LabelValue<'portfolio' | 'transactions'>[] = [
    {
      label: 'Portfolio',
      value: 'portfolio',
    },
    {
      label: 'Transactions',
      value: 'transactions',
    },
  ];

  selectedValueSignal = signal<'portfolio' | 'transactions'>('portfolio');

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

    userPortfolioTransactions$.subscribe((data) => {
      this.portfolioTransactions.set(data.transactions);
    });

    // load user portfolio state
    userPortfolioTransactions$
      .pipe(
        switchMap((data) =>
          this.portfolioCalculationService.getPortfolioStateHoldings(
            data.userData.portfolioState.startingCash,
            data.transactions,
          ),
        ),
      )
      .subscribe((portfolioState) => this.portfolioStateHoldingSignal.set(portfolioState));

    userPortfolioTransactions$
      .pipe(switchMap((data) => from(this.portfolioCalculationService.getPortfolioGrowthAssets(data.transactions))))
      .subscribe((portfolioGrowthAssets) => this.portfolioGrowthAssetsSignal.set(portfolioGrowthAssets));
  }

  onDialogClose() {
    this.dialogRef.close();
  }
}
