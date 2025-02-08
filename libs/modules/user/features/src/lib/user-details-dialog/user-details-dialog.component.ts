import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserApiService } from '@mm/api-client';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, SectionTitleComponent } from '@mm/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { map, startWith, switchMap, tap } from 'rxjs';
import { UserDetailsDialogAdminComponent } from './user-details-dialog-admin/user-details-dialog-admin.component';

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
    PortfolioStateTransactionsComponent,
    PortfolioStateRiskComponent,
    PortfolioStateComponent,
    DatePipe,
    PortfolioTransactionsTableComponent,
    PortfolioGrowthChartComponent,
    PortfolioHoldingsTableCardComponent,
    PortfolioTransactionsItemComponent,
    SectionTitleComponent,
    NgClass,
    UserDetailsDialogAdminComponent,
  ],
  template: `
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-6">
        <!-- display user -->
        @if (userDataSignal(); as user) {
          <div class="flex items-center gap-2">
            <img appDefaultImg [src]="user.personal.photoURL" alt="User Image" class="h-12 w-12 rounded-full" />
            <div class="flex flex-col">
              <span class="text-xl">{{ user.personal.displayName }}</span>
              <span class="text-sm">{{ user.accountCreatedDate | date: 'MMMM d, y' }}</span>
            </div>
          </div>
        }
      </div>

      <!-- close -->
      <button
        data-testid="user-details-dialog-close-button"
        mat-icon-button
        color="warn"
        type="button"
        (click)="onDialogClose()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="md:h-[75vh]">
      <!-- check if myself if an admin -->
      @if (userDataSignal(); as userData) {
        @if (authUserData().isAdmin) {
          <app-user-details-dialog-admin [authUserData]="authUserData()" [selectedUserData]="userData" />
        }

        <div class="pb-2">
          <mat-divider />
        </div>
        <!-- display portfolio -->
        <div class="divide-wt-border flex flex-row divide-x-2 p-2">
          <!-- portfolio state -->
          <div class="py-2 max-lg:flex-1 sm:px-4 lg:basis-[40%]">
            <app-portfolio-state
              data-testid="user-details-portfolio-state"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [portfolioState]="userData.portfolioState"
              [showCashSegment]="userData.userAccountType === 'DEMO_TRADING'"
            />
          </div>
          <!-- risk -->
          <div class="hidden flex-1 px-4 py-2 md:block">
            <app-portfolio-state-risk
              data-testid="user-details-portfolio-state-risk"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [portfolioRisk]="userData.portfolioRisk"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
            />
          </div>
          <!-- transactions -->
          <div class="hidden flex-1 px-4 py-2 lg:block">
            <app-portfolio-state-transactions
              data-testid="user-details-portfolio-state-transactions"
              [portfolioState]="userData.portfolioState"
              [titleColor]="ColorScheme.GRAY_DARK_VAR"
              [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
              [showFees]="userData.userAccountType === 'DEMO_TRADING'"
            />
          </div>
        </div>

        <div class="py-2 max-md:mb-2">
          <mat-divider />
        </div>

        <div class="md:p-4">
          <!-- portfolio growth charts -->
          @if (portfolioGrowth().state === 'loaded') {
            <app-portfolio-growth-chart
              data-testid="user-details-portfolio-growth-chart"
              headerTitle="Portfolio Growth"
              chartType="balance"
              [displayLegend]="true"
              [data]="{
                values: portfolioGrowth().data,
              }"
              [heightPx]="375"
              class="mb-6"
            />
          } @else {
            <div class="grid h-[400px] place-content-center">
              <mat-spinner />
            </div>
          }

          <div class="mb-6">
            <mat-divider />
          </div>

          <!-- holding table -->
          <div class="mb-6 max-sm:pl-2">
            <app-portfolio-holdings-table-card
              data-testid="user-details-portfolio-holdings-table-card"
              [displayedColumns]="displayedColumns"
              [portfolioStateHolding]="portfolioStateHolding()"
              [showInCard]="false"
              [initialItemsLimit]="8"
            />
          </div>

          <div class="mb-6">
            <mat-divider />
          </div>

          <!-- best and worst transactions -->
          <div class="divide-wt-border mb-6 grid gap-y-4 md:grid-cols-2 md:divide-x-2">
            <div class="py-2 md:pr-6">
              <!-- best transactions -->
              <app-section-title title="Best Returns" matIcon="trending_up" class="mb-3" titleSize="base" />
              @for (item of portfolioTransactions().best; track item.transactionId; let last = $last) {
                <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                  <app-portfolio-transactions-item [transaction]="item" />
                </div>
              } @empty {
                <div class="py-2">
                  <div class="g-table-empty">No data has been found</div>
                </div>
              }
            </div>

            <div class="py-2 md:hidden">
              <mat-divider />
            </div>

            <div class="py-2 md:pl-6">
              <!-- worst transactions -->
              <app-section-title title="Worst Returns" matIcon="trending_down" class="mb-3" titleSize="base" />
              @for (item of portfolioTransactions().worst; track item.transactionId; let last = $last) {
                <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                  <app-portfolio-transactions-item [transaction]="item" />
                </div>
              } @empty {
                <div class="py-2">
                  <div class="g-table-empty">No data has been found</div>
                </div>
              }
            </div>
          </div>

          <div class="mb-6 max-md:hidden">
            <mat-divider />
          </div>

          <!-- transaction history -->
          <div class="max-md:hidden">
            <app-portfolio-transactions-table
              data-testid="user-details-portfolio-transactions-table"
              titleSize="base"
              [data]="portfolioTransactions().transactions"
            />
          </div>
        </div>
      } @else {
        <div class="grid h-[400px] place-content-center">
          <mat-spinner data-testid="user-details-dialog-loading-spinner" />
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
  private readonly dialogRef = inject(MatDialogRef);
  private readonly userApiService = inject(UserApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly portfolioCalculationService = inject(PortfolioCalculationService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly data = inject<UserDetailsDialogComponentData>(MAT_DIALOG_DATA);

  private readonly userData$ = this.userApiService.getUserById(this.data.userId).pipe(
    tap((userData) => {
      if (!userData) {
        this.dialogServiceUtil.showNotificationBar(`User not found`, 'error');
        this.onDialogClose();
      }
    }),
    filterNil(),
  );

  readonly authUserData = this.authenticationUserStoreService.state.getUserData;
  readonly userDataSignal = toSignal(this.userData$);

  readonly portfolioTransactions = toSignal(
    this.userData$.pipe(
      map((userData) => userData),
      filterNil(),
      switchMap((userData) =>
        this.userApiService.getUserPortfolioTransactions(userData.id).pipe(
          map((transactions) => ({
            transactions: transactions.transactions,
            best: transactions.transactions
              .filter((d) => d.returnValue > 0)
              .sort((a, b) => b.returnValue - a.returnValue)
              .slice(0, 5),
            worst: transactions.transactions
              .filter((d) => d.returnValue < 0)
              .sort((a, b) => a.returnValue - b.returnValue)
              .slice(0, 5),
          })),
        ),
      ),
    ),
    {
      initialValue: { transactions: [], best: [], worst: [] },
    },
  );

  readonly portfolioStateHolding = toSignal(
    this.userData$.pipe(
      switchMap((userData) =>
        this.portfolioCalculationService.getPortfolioStateHoldings(
          userData.portfolioState,
          userData.holdingSnapshot.data,
        ),
      ),
    ),
  );

  readonly portfolioGrowth = toSignal(
    this.userData$.pipe(
      switchMap((userData) =>
        this.userApiService
          .getUserPortfolioGrowth(userData.id)
          .pipe(map((data) => ({ data, state: 'loaded' as const }))),
      ),
      startWith({ data: [], state: 'loading' as const }),
    ),
    { initialValue: { data: [], state: 'loading' as const } },
  );

  readonly ColorScheme = ColorScheme;

  readonly displayedColumns = ['symbol', 'price', 'balance', 'invested', 'totalChange', 'portfolio', 'marketCap'];

  onDialogClose() {
    this.dialogRef.close();
  }
}
