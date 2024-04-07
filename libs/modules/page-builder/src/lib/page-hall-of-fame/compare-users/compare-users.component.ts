import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserApiService } from '@mm/api-client';
import { UserBase } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthCompareChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeTableComponent,
  PortfolioStateRiskTableComponent,
  PortfolioStateTableComponent,
  PortfolioStateTransactionsTableComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { InputSource } from '@mm/shared/data-access';
import { DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  PieChartComponent,
  SectionTitleComponent,
  ShowMoreButtonComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';
import { UserSearchControlComponent } from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { computedFrom } from 'ngxtension/computed-from';
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
    PortfolioHoldingsTableComponent,
    MatDialogModule,
    StockSummaryDialogComponent,
    PortfolioTransactionsTableComponent,
    SortByKeyPipe,
    ShowMoreButtonComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div
      class="xl:absolute xl:top-[-100px] xl:left-0 flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10"
    >
      <!-- title -->
      <app-section-title matIcon="diversity_3" title="Compare Users" />

      <!-- search users -->
      <app-user-search-control
        class="md:scale-90 w-full md:w-[500px] xl:mt-3"
        (selectedUserEmitter)="onUserClick($event)"
        [isDisabled]="loadingState()"
      />
    </div>

    <!-- selected users -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-3 mb-10">
      @for (user of selectedUsers(); track user.id) {
        <app-general-card>
          <div class="flex gap-4 justify-between">
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
    <div class="grid lg:grid-cols-2 xl:grid-cols-10 gap-x-4 gap-y-4 mb-10">
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
        <div class="grid grid-cols-2 xl:grid-cols-3 mb-10">
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
      <div class="flex items-center justify-between mb-4">
        <app-section-title title="Selected User: {{ selectedUser()?.userData?.personal?.displayName }}" />

        <app-form-mat-input-wrapper
          class="w-[360px]"
          inputCaption="Select User's Holdings"
          inputType="SELECT"
          [formControl]="selectedUserHoldingsControl"
          [inputSource]="selectedUsersInputSource()"
        />
      </div>

      <!-- table -->
      <div class="mb-10">
        <app-general-card
          title="Holdings {{ (selectedUser()?.portfolioState?.holdings ?? []).length }}"
          matIcon="show_chart"
        >
          <app-portfolio-holdings-table
            (symbolClicked)="onSummaryClick($event)"
            [holdings]="selectedUserHoldings()"
            [portfolioState]="selectedUser()?.portfolioState"
          ></app-portfolio-holdings-table>
          <!-- show more members button -->
          <div class="flex justify-end">
            <app-show-more-button
              [(showMoreToggle)]="selectedUserHoldingsToggle"
              [itemsLimit]="12"
              [itemsTotal]="(selectedUser()?.portfolioState?.holdings ?? []).length"
            />
          </div>
        </app-general-card>
      </div>

      <!-- transaction history -->
      <div class="mb-4">
        <app-section-title title="Transaction History" matIcon="history" class="mb-3" />
        <app-portfolio-transactions-table [showTransactionFees]="true" [data]="selectedUser()?.userTransactions" />
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
  private dialog = inject(MatDialog);
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
                        .getPortfolioStateHoldings(userData.portfolioState, userData.holdingSnapshot.data)
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

  selectedUser = computedFrom(
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

  /**
   * toggle to display every holding for the selected user
   */
  selectedUserHoldingsToggle = signal(false);
  selectedUserHoldings = computed(() =>
    this.selectedUserHoldingsToggle()
      ? this.selectedUser()?.portfolioState?.holdings ?? []
      : (this.selectedUser()?.portfolioState?.holdings ?? []).slice(0, 12),
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

  onSummaryClick(symbol: string) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
