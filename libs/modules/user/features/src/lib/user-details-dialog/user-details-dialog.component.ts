import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserApiService } from '@mm/api-client';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioHoldingsTableComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme, LabelValue } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, SectionTitleComponent, TabSelectControlComponent } from '@mm/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { combineLatest, from, map, share, startWith, switchMap, tap } from 'rxjs';

export type UserDetailsDialogComponentData = {
  userId: string;
};

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
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
    TabSelectControlComponent,
    DatePipe,
    PortfolioTransactionsTableComponent,
    PortfolioHoldingsTableComponent,
    PortfolioGrowthChartComponent,
    PortfolioHoldingsTableCardComponent,
  ],
  template: `
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-6">
        <!-- display user -->
        @if (userDataSignal(); as user) {
          <div class="flex items-center gap-2">
            <img appDefaultImg [src]="user.personal.photoURL" alt="User Image" class="h-14 w-14 rounded-full" />
            <div class="flex flex-col">
              <span class="text-xl">{{ user.personal.displayName }}</span>
              <span class="text-sm">{{ user.accountCreatedDate | date: 'MMMM d, y' }}</span>
            </div>
          </div>
        }

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
          <mat-divider />
        </div>
        <!-- display portfolio -->
        <div class="divide-wt-border flex flex-row divide-x-2 p-2">
          <!-- portfolio state -->
          <div class="p-2 max-lg:flex-1 lg:basis-[40%]">
            @if (portfolioStateHoldingSignal(); as portfolioStateHoldingSignal) {
              <app-portfolio-state
                [titleColor]="ColorScheme.GRAY_DARK_VAR"
                [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
                [portfolioState]="portfolioStateHoldingSignal"
                [showCashSegment]="userData.userAccountType === 'DEMO_TRADING'"
              />
            } @else {
              <div class="g-skeleton h-[120px]"></div>
            }
          </div>
          <!-- risk -->
          <div class="hidden flex-1 p-2 md:block">
            @if (portfolioStateHoldingSignal()) {
              <app-portfolio-state-risk
                [titleColor]="ColorScheme.GRAY_DARK_VAR"
                [portfolioRisk]="userDataSignal()?.portfolioRisk"
                [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              />
            } @else {
              <div class="g-skeleton h-[120px]"></div>
            }
          </div>
          <!-- transactions -->
          <div class="hidden flex-1 p-2 lg:block">
            @if (portfolioStateHoldingSignal(); as portfolioStateHoldingSignal) {
              <app-portfolio-state-transactions
                [portfolioState]="portfolioStateHoldingSignal"
                [titleColor]="ColorScheme.GRAY_DARK_VAR"
                [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
                [showFees]="userData.userAccountType === 'DEMO_TRADING'"
              />
            } @else {
              <div class="g-skeleton h-[120px]"></div>
            }
          </div>
        </div>

        <div class="py-2 max-md:mb-2">
          <mat-divider />
        </div>

        <div class="p-4">
          @if (selectedValueSignal() === 'portfolio') {
            <!-- portfolio growth charts -->
            @if (portfolioGrowthSignal().state === 'loaded') {
              <app-portfolio-growth-chart
                headerTitle="Portfolio Growth"
                chartType="balance"
                [displayLegend]="true"
                [data]="{
                  values: portfolioGrowthSignal().data,
                }"
                [heightPx]="375"
                class="mb-6"
              />
            } @else {
              <div class="grid h-[400px] place-content-center">
                <mat-spinner />
              </div>
            }

            <!-- holding table -->
            <div class="mb-6 max-sm:pl-2">
              <app-portfolio-holdings-table-card
                [displayedColumns]="displayedColumns"
                [portfolioStateHolding]="portfolioStateHoldingSignal()"
              />
            </div>
          } @else if (selectedValueSignal() === 'transactions') {
            <!-- transaction -->
            <div class="pt-3">
              <app-portfolio-transactions-table [data]="portfolioTransactions()" />
            </div>
          }
        </div>
      } @else {
        <div class="grid h-[400px] place-content-center">
          <mat-spinner />
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
  readonly #dialogRef = inject(MatDialogRef);
  readonly #userApiService = inject(UserApiService);
  readonly #dialogServiceUtil = inject(DialogServiceUtil);
  readonly #portfolioCalculationService = inject(PortfolioCalculationService);
  readonly data = inject<UserDetailsDialogComponentData>(MAT_DIALOG_DATA);

  readonly #userData = this.#userApiService.getUserById(this.data.userId).pipe(
    tap((userData) => {
      if (!userData) {
        this.#dialogServiceUtil.showNotificationBar(`User not found`, 'error');
        this.onDialogClose();
      }
    }),
    filterNil(),
    share(),
  );
  readonly #portfolioTransactions = this.#userData.pipe(
    map((userData) => userData),
    filterNil(),
    switchMap((userData) =>
      this.#userApiService
        .getUserPortfolioTransactions(userData.id)
        .pipe(map((transactions) => transactions.transactions)),
    ),
    share(),
  );

  readonly userDataSignal = toSignal(this.#userData);

  readonly portfolioTransactions = toSignal(this.#portfolioTransactions);

  readonly portfolioStateHoldingSignal = toSignal(
    combineLatest([this.#userData, this.#portfolioTransactions]).pipe(
      switchMap(([userData, transactions]) =>
        this.#portfolioCalculationService.getPortfolioStateHoldings(
          userData?.portfolioState?.startingCash ?? 0,
          transactions,
        ),
      ),
    ),
  );

  readonly portfolioGrowthSignal = toSignal(
    combineLatest([this.#userData, this.#portfolioTransactions]).pipe(
      switchMap(([userData, transactions]) =>
        from(this.#portfolioCalculationService.getPortfolioGrowthAssets(transactions)).pipe(
          map((growth) =>
            this.#portfolioCalculationService.getPortfolioGrowth(growth, userData?.portfolioState?.startingCash ?? 0),
          ),
          map((data) => ({ data, state: 'loaded' as const })),
        ),
      ),
      startWith({ data: [], state: 'loading' as const }),
    ),
    { initialValue: { data: [], state: 'loading' as const } },
  );

  readonly ColorScheme = ColorScheme;

  readonly displayOptions: LabelValue<'portfolio' | 'transactions'>[] = [
    {
      label: 'Portfolio',
      value: 'portfolio',
    },
    {
      label: 'Transactions',
      value: 'transactions',
    },
  ];

  readonly displayedColumns = ['symbol', 'price', 'balance', 'invested', 'totalChange', 'portfolio', 'marketCap'];

  readonly selectedValueSignal = signal<'portfolio' | 'transactions'>('portfolio');

  onDialogClose() {
    this.#dialogRef.close();
  }
}
