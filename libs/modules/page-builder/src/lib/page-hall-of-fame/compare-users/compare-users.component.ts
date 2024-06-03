import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserApiService } from '@mm/api-client';
import { UserBase } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthCompareChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioPeriodChangeTableComponent,
  PortfolioStateRiskTableComponent,
  PortfolioStateTableComponent,
  PortfolioStateTransactionsTableComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { InputSource } from '@mm/shared/data-access';
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
import { forkJoin, from, map, mergeMap, of, pipe, startWith, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-compare-users',
  standalone: true,
  imports: [
    CommonModule,
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
    ReactiveFormsModule,
    PortfolioHoldingsTableCardComponent,
    MatDialogModule,
    StockSummaryDialogComponent,
    PortfolioTransactionsTableComponent,
    SortByKeyPipe,
    ShowMoreButtonComponent,
    MatButtonModule,
    MatIconModule,
    DropdownControlComponent,
  ],
  template: `
    <div
      class="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center xl:absolute xl:left-0 xl:top-[-100px]"
    >
      <!-- title -->
      <app-section-title matIcon="diversity_3" title="Compare Users" />

      <!-- search users -->
      <app-user-search-control
        class="w-full md:w-[500px] md:scale-90 xl:mt-3"
        (selectedUserEmitter)="onUserClick($event)"
        [isDisabled]="loadingState()"
      />
    </div>

    <!-- selected users -->
    <div class="mb-10 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
      @for (user of selectedUsers(); track user.id) {
        <app-general-card>
          <div class="flex justify-between gap-4">
            <app-user-display-item [userData]="user" />
            <!-- remove button -->
            <button mat-icon-button color="warn" (click)="onRemoveUser(user)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </app-general-card>
      }
    </div>

    <!-- compare portfolio chart -->
    <div class="mb-10">
      <app-section-title title="Portfolio Compare" />
      @if (!loadingState()) {
        <app-portfolio-growth-compare-chart [heightPx]="400" [data]="selectedUsersData()" />
      } @else {
        <div class="g-skeleton h-[375px]"></div>
      }
    </div>

    <!-- display compare tables -->
    <div class="mb-10 grid gap-x-4 gap-y-4 lg:grid-cols-2 xl:grid-cols-10">
      <app-general-card title="State" class="lg:col-span-2 xl:col-span-4">
        <!-- table -->
        <app-portfolio-state-table [data]="selectedUsersData()" />
        <!-- loading skeleton -->
        <div *ngIf="loadingState()" class="g-skeleton h-12"></div>
      </app-general-card>

      <app-general-card title="Risk" class="xl:col-span-3">
        <!-- table -->
        <app-portfolio-state-risk-table [data]="selectedUsersData()" />
        <!-- loading skeleton -->
        <div *ngIf="loadingState()" class="g-skeleton h-12"></div>
      </app-general-card>

      <app-general-card title="Transactions" class="xl:col-span-3">
        <!-- table -->
        <app-portfolio-state-transactions-table [data]="selectedUsersData()" />
        <!-- loading skeleton -->
        <div *ngIf="loadingState()" class="g-skeleton h-12"></div>
      </app-general-card>
    </div>

    <!-- portfolio change table -->
    <div class="mb-10 hidden md:block">
      <app-general-card title="Period Change">
        <!-- table -->
        <app-portfolio-period-change-table [data]="selectedUsersData()" />
        <!-- loading skeleton -->
        <div *ngIf="loadingState()" class="g-skeleton h-12"></div>
      </app-general-card>
    </div>

    @if (selectedUsersData().length > 0) {
      <!-- allocation charts -->
      <div class="hidden md:block">
        <app-section-title title="Asset Allocation" />
        <div class="mb-10 grid grid-cols-2 xl:grid-cols-3">
          @for (userData of selectedUsersData(); track userData.userBase.id) {
            <app-pie-chart
              [chartTitle]="'Allocation: ' + userData.userBase.personal.displayNameInitials"
              [heightPx]="365"
              [series]="userData.portfolioAssetAllocation"
            />
          }

          <!-- loading skeleton -->
          <div *ngIf="loadingState()" class="g-skeleton h-[350px]"></div>
        </div>
      </div>

      <!-- holding title -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="space-x-2 text-xl">
          <span class="text-wt-primary">Selected User: </span>
          <span class="text-wt-gray-dark">{{ selectedUser()?.userData?.personal?.displayName }}</span>
        </h2>

        <app-dropdown-control
          class="w-[360px]"
          inputCaption="Select User's Holdings"
          [formControl]="selectedUserHoldingsControl"
          [inputSource]="selectedUsersInputSource()"
        />
      </div>

      <!-- table -->
      <div class="mb-10">
        <app-portfolio-holdings-table-card [portfolioStateHolding]="selectedUser()?.portfolioState" />
      </div>

      <!-- transaction history -->
      <div class="mb-4">
        <app-portfolio-transactions-table
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
export class CompareUsersComponent {
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private portfolioCalculationService = inject(PortfolioCalculationService);
  private userApiService = inject(UserApiService);
  private dialogServiceUtil = inject(DialogServiceUtil);

  /**
   * toggled when selecting a new user and data is not yet loaded
   */
  loadingState = computed(() => this.selectedUsers().length !== this.selectedUsersData().length);

  selectedUsers = signal<UserBase[]>([this.authenticationUserStoreService.state.getUserData()]);
  selectedUserHoldingsControl = new FormControl<UserBase | null>(
    this.authenticationUserStoreService.state.getUserData(),
  );

  /**
   * load user data when selected users change
   */
  selectedUsersData = toSignal(
    toObservable(this.selectedUsers).pipe(
      mergeMap((users) =>
        users.length === 0
          ? of([])
          : forkJoin(
              users.map((userBase) =>
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
                        .getPortfolioStateHoldings(userData.portfolioState.startingCash, userTransactions.transactions)
                        .pipe(take(1)),
                      portfolioGrowth: from(
                        this.portfolioCalculationService.getPortfolioGrowthAssets(userTransactions.transactions),
                      ).pipe(
                        map((portfolioGrowth) =>
                          this.portfolioCalculationService.getPortfolioGrowth(
                            portfolioGrowth,
                            userData.portfolioState.startingCash,
                          ),
                        ),
                      ),
                    }).pipe(
                      map((data) => ({
                        ...data,
                        portfolioChange: this.portfolioCalculationService.getPortfolioChange(data.portfolioGrowth),
                        portfolioAssetAllocation: this.portfolioCalculationService.getPortfolioAssetAllocationPieChart(
                          data.portfolioState.holdings,
                        ),
                        portfolioRisk: data.userData.portfolioRisk,
                      })),
                    ),
                  ),
                ),
              ),
            ),
      ),
    ),
    { initialValue: [] },
  );

  selectedUsersDataEffect = effect(() => console.log('selectedUsersData', this.selectedUsersData()));

  /**
   * selected user from a dropdown
   */
  selectedUsersInputSource = computed(() =>
    this.selectedUsers().map(
      (user) =>
        ({
          value: user,
          caption: user.personal.displayName,
          image: user.personal.photoURL,
          imageType: 'default',
        }) satisfies InputSource<UserBase>,
    ),
  );

  selectedUser = derivedFrom(
    [
      this.selectedUserHoldingsControl.valueChanges.pipe(startWith(this.selectedUserHoldingsControl.value)),
      this.selectedUsersData,
    ],
    pipe(
      switchMap(([selectedUser, selectedUsersData]) =>
        of(selectedUsersData.find((data) => data.userBase.id === selectedUser?.id)),
      ),
    ),
  );

  onUserClick(user: UserBase) {
    // prevent selecting same user twice
    if (this.selectedUsers().find((u) => u.id === user.id)) {
      return;
    }

    // select user
    if (this.selectedUsers().length < 6) {
      this.selectedUsers.set([...this.selectedUsers(), user]);
    } else {
      this.dialogServiceUtil.showNotificationBar('You can compare up to 6 users', 'error');
    }
  }

  onRemoveUser(user: UserBase) {
    this.selectedUsers.set(this.selectedUsers().filter((u) => u.id !== user.id));
  }
}
