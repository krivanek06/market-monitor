import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserApiService } from '@mm/api-client';
import {
  PortfolioGrowth,
  PortfolioRisk,
  PortfolioStateHoldings,
  PortfolioTransaction,
  UserBase,
  UserData,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioCalculationService, PortfolioChange } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthCompareChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioPeriodChangeTableComponent,
  PortfolioStateRiskTableComponent,
  PortfolioStateTableComponent,
  PortfolioStateTransactionsTableComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { GenericChartSeries, InputSource } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import {
  DropdownControlComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  PieChartComponent,
  SectionTitleComponent,
  ShowMoreButtonComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';
import { UserSearchControlComponent } from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { derivedFrom } from 'ngxtension/derived-from';
import { filterNil } from 'ngxtension/filter-nil';
import { Subject, catchError, forkJoin, map, merge, of, pipe, scan, startWith, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-page-compare-users',
  standalone: true,
  imports: [
    SectionTitleComponent,
    UserSearchControlComponent,
    ReactiveFormsModule,
    UserDisplayItemComponent,
    PortfolioStateTableComponent,
    PortfolioGrowthCompareChartComponent,
    PortfolioStateRiskTableComponent,
    PortfolioPeriodChangeTableComponent,
    PortfolioStateTransactionsTableComponent,
    GeneralCardComponent,
    PieChartComponent,
    FormMatInputWrapperComponent,
    PortfolioHoldingsTableCardComponent,
    MatDialogModule,
    SymbolSummaryDialogComponent,
    PortfolioTransactionsTableComponent,
    SortByKeyPipe,
    ShowMoreButtonComponent,
    MatButtonModule,
    MatIconModule,
    DropdownControlComponent,
  ],
  template: `
    <div class="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <!-- title -->
      <app-section-title matIcon="diversity_3" title="Compare Users" />

      <!-- search users -->
      <app-user-search-control
        data-testid="page-compare-users-search"
        class="w-full md:w-[500px] md:scale-90 xl:mt-3"
        [formControl]="searchUserControl"
        [isDisabled]="selectedUsersData().isLoading"
      />
    </div>

    <!-- selected users -->
    <div class="mb-10 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
      @for (item of selectedUsersData().data; track item.userData.id) {
        <app-general-card>
          <div class="flex justify-between gap-4">
            <app-user-display-item data-testid="page-compare-user-display-item" [userData]="item.userData" />
            <!-- remove button -->
            <button
              data-testid="page-compare-user-remove"
              mat-icon-button
              color="warn"
              (click)="onRemoveUser(item.userData)"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </app-general-card>
      }
    </div>

    <!-- compare portfolio chart -->
    <div class="mb-10">
      <app-section-title title="Portfolio Compare" />
      @if (selectedUsersData().isLoading) {
        <!-- loading skeleton -->
        <div data-testid="page-compare-loading" class="g-skeleton mt-6 h-[385px]"></div>
      } @else {
        <!-- chart -->
        <app-portfolio-growth-compare-chart
          data-testid="page-compare-portfolio-growth-compare-chart"
          [heightPx]="400"
          [data]="selectedUsersData().data"
        />
      }
    </div>

    <!-- display compare tables -->
    <div class="mb-10 grid gap-x-4 gap-y-4 lg:grid-cols-2 xl:grid-cols-10">
      <app-general-card title="State" class="lg:col-span-2 xl:col-span-4">
        <!-- table -->
        <app-portfolio-state-table data-testid="page-compare-portfolio-state-table" [data]="selectedUsersData().data" />
        <!-- loading skeleton -->
        @if (selectedUsersData().isLoading) {
          <div data-testid="page-compare-loading" class="g-skeleton h-12"></div>
        }
      </app-general-card>

      <app-general-card title="Risk" class="xl:col-span-3">
        <!-- table -->
        <app-portfolio-state-risk-table
          data-testid="page-compare-portfolio-risk-table"
          [data]="selectedUsersData().data"
        />
        <!-- loading skeleton -->
        @if (selectedUsersData().isLoading) {
          <div data-testid="page-compare-loading" class="g-skeleton h-12"></div>
        }
      </app-general-card>

      <app-general-card title="Transactions" class="xl:col-span-3">
        <!-- table -->
        <app-portfolio-state-transactions-table
          data-testid="page-compare-portfolio-transaction-table"
          [data]="selectedUsersData().data"
        />
        <!-- loading skeleton -->
        @if (selectedUsersData().isLoading) {
          <div data-testid="page-compare-loading" class="g-skeleton h-12"></div>
        }
      </app-general-card>
    </div>

    <!-- portfolio change table -->
    <div class="mb-10 hidden sm:block">
      <app-general-card title="Period Change">
        <!-- table -->
        <app-portfolio-period-change-table
          data-testid="page-compare-period-change-table"
          [data]="selectedUsersData().data"
        />
        <!-- loading skeleton -->
        @if (selectedUsersData().isLoading) {
          <div data-testid="page-compare-loading" class="g-skeleton h-12"></div>
        }
      </app-general-card>
    </div>

    @if (selectedUsersData().data.length > 0) {
      <!-- allocation charts -->
      <div class="hidden md:block">
        <app-section-title title="Asset Allocation" />
        <div class="mb-10 grid grid-cols-2 xl:grid-cols-3">
          @for (userData of selectedUsersData().data; track userData.userBase.id) {
            <app-pie-chart
              data-testid="page-compare-allocation-chart"
              [chartTitle]="'Allocation: ' + userData.userBase.personal.displayNameInitials"
              [heightPx]="365"
              [series]="userData.portfolioAssetAllocation"
            />
          }

          <!-- loading skeleton -->
          @if (selectedUsersData().isLoading) {
            <div data-testid="page-compare-loading" class="g-skeleton h-[350px]"></div>
          }
        </div>
      </div>

      <!-- holding title -->
      <div class="mb-4 flex flex-col items-center justify-between gap-y-4 sm:flex-row">
        <h2 class="space-x-2 text-xl">
          <span class="text-wt-primary">Selected User: </span>
          <span class="text-wt-gray-dark">{{ selectedUser()?.userData?.personal?.displayName }}</span>
        </h2>

        <!-- select different user's holdings -->
        <app-dropdown-control
          data-testid="page-compare-select-user-holding-dropdown"
          class="w-full sm:w-[360px]"
          inputCaption="Select User's Holdings"
          [formControl]="selectedUserHoldingsControl"
          [inputSource]="selectedUsersInputSource()"
        />
      </div>

      <!-- table -->
      <div class="mb-10">
        <app-portfolio-holdings-table-card
          data-testid="page-compare-holding-table-card"
          [portfolioStateHolding]="selectedUser()?.portfolioState"
        />
      </div>

      <!-- transaction history -->
      <div class="mb-4">
        <app-portfolio-transactions-table
          data-testid="page-compare-transaction-table"
          [showSymbolFilter]="true"
          [showTransactionFees]="true"
          [data]="selectedUser()?.userTransactions"
        />
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCompareUsersComponent {
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly portfolioCalculationService = inject(PortfolioCalculationService);
  private readonly userApiService = inject(UserApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);

  /**
   * emit when user is selected
   */
  readonly searchUserControl = new FormControl<UserData>(this.authenticationUserStoreService.state.getUserData(), {
    nonNullable: true,
  });

  /**
   * change when checking other user's holdings
   */
  readonly selectedUserHoldingsControl = new FormControl<UserBase>(
    this.authenticationUserStoreService.state.getUserData(),
  );

  private readonly removeUser$ = new Subject<UserBase>();
  private readonly loadedUserData$ = this.searchUserControl.valueChanges.pipe(
    startWith(this.searchUserControl.value),
    switchMap((userBase) =>
      forkJoin({
        userData: this.userApiService.getUserById(userBase.id).pipe(filterNil(), take(1)),
        userTransactions: this.userApiService.getUserPortfolioTransactions(userBase.id).pipe(take(1)),
      }).pipe(
        switchMap(({ userData, userTransactions }) =>
          forkJoin({
            userBase: of(userBase),
            userData: of(userData),
            userTransactions: of(userTransactions.transactions),
            portfolioState: this.portfolioCalculationService
              .getPortfolioStateHoldings(userData.portfolioState, userTransactions.transactions)
              .pipe(take(1)),
            portfolioGrowth: this.userApiService.getUserPortfolioGrowth(userBase.id).pipe(take(1)),
          }).pipe(
            map((data) => ({
              ...data,
              portfolioChange: this.portfolioCalculationService.getPortfolioChange(data.portfolioGrowth),
              portfolioAssetAllocation: this.portfolioCalculationService.getPortfolioAssetAllocationPieChart(
                data.portfolioState.holdings,
              ),
              portfolioRisk: data.userData.portfolioRisk,
            })),
            map((d) => ({
              data: d,
              action: 'add' as const,
            })),
          ),
        ),
        startWith({
          data: null,
          action: 'loading' as const,
        }),
        catchError((err) => of({ data: null, action: 'error' as const, err })),
      ),
    ),
  );

  /**
   * load user data when selected users change
   */
  readonly selectedUsersData = toSignal(
    merge(
      this.loadedUserData$,
      this.removeUser$.pipe(
        map((d) => ({
          data: d,
          action: 'remove' as const,
        })),
      ),
    ).pipe(
      scan(
        (acc, curr) => {
          // loading state
          if (curr.action === 'loading') {
            return {
              data: acc.data,
              isLoading: true,
            };
          }

          // prevent adding more than 6 people
          if (curr.action === 'add' && acc.data.length >= 6) {
            this.dialogServiceUtil.showNotificationBar('You can only compare up to 6 users at a time', 'error');
            return {
              data: acc.data,
              isLoading: false,
            };
          }

          // prevent adding same user
          if (curr.action === 'add' && acc.data.find((d) => d.userBase.id === curr.data.userBase.id)) {
            this.dialogServiceUtil.showNotificationBar('User already selected', 'error');
            return {
              data: acc.data,
              isLoading: false,
            };
          }

          // add state
          if (curr.action === 'add') {
            return {
              data: [...acc.data, curr.data],
              isLoading: false,
            };
          }

          // remove state
          if (curr.action === 'remove') {
            return {
              data: acc.data.filter((d) => d.userBase.id !== curr.data.id),
              isLoading: false,
            };
          }

          // error happened
          if (curr.action === 'error') {
            this.dialogServiceUtil.showNotificationBar('Error loading user data', 'error');
            return {
              data: acc.data,
              isLoading: false,
            };
          }

          return acc;
        },
        {
          data: [],
          isLoading: false,
        } as {
          data: {
            userBase: UserBase;
            userData: UserData;
            userTransactions: PortfolioTransaction[];
            portfolioState: PortfolioStateHoldings;
            portfolioGrowth: PortfolioGrowth[];
            portfolioChange: PortfolioChange;
            portfolioAssetAllocation: GenericChartSeries<'pie'>;
            portfolioRisk?: PortfolioRisk | null;
          }[];
          isLoading: boolean;
        },
      ),
    ),
    {
      initialValue: {
        data: [],
        isLoading: false,
      },
    },
  );

  /**
   * selected user from a dropdown
   */
  readonly selectedUsersInputSource = computed(() =>
    this.selectedUsersData()
      .data.map((d) => d.userBase)
      .map(
        (user) =>
          ({
            value: user,
            caption: user.personal.displayName,
            image: user.personal.photoURL,
            imageType: 'default',
          }) satisfies InputSource<UserBase>,
      ),
  );

  readonly selectedUser = derivedFrom(
    [
      this.selectedUserHoldingsControl.valueChanges.pipe(startWith(this.selectedUserHoldingsControl.value)),
      this.selectedUsersData,
    ],
    pipe(
      switchMap(([selectedUser, selectedUsersData]) =>
        of(selectedUsersData.data.find((data) => data.userBase.id === selectedUser?.id)),
      ),
    ),
  );

  onRemoveUser(user: UserBase) {
    this.removeUser$.next(user);
  }
}
