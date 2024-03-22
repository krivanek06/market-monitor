import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { UserApiService } from '@mm/api-client';
import { UserBase } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PortfolioCalculationService, PortfolioGrowthService } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthCompareChartComponent,
  PortfolioPeriodChangeTableComponent,
  PortfolioStateRiskTableComponent,
  PortfolioStateTableComponent,
  PortfolioStateTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { GeneralCardComponent, SectionTitleComponent } from '@mm/shared/ui';
import { UserSearchControlComponent } from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { catchError, forkJoin, from, map, mergeMap, of, switchMap, take } from 'rxjs';

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
  ],
  template: `
    <div class="absolute top-[-100px] left-0 hidden md:flex items-center gap-6 mb=10">
      <!-- title -->
      <app-section-title matIcon="diversity_3" title="Compare Users" />

      <!-- search users -->
      <app-user-search-control class="scale-90 w-[500px] mt-3" (selectedUserEmitter)="onUserClick($event)" />
    </div>

    <!-- selected users -->
    <div class="flex items-center flex-wrap gap-x-6 gap-y-3 mb-10">
      @for (user of selectedUsers(); track user.id) {
        <div class="p-4 block shadow-md min-w-[360px] rounded-md">
          <app-user-display-item [userData]="user" />
        </div>
      }
    </div>

    <div class="mb-10">
      <app-section-title title="Portfolio Compare" />
      <app-portfolio-growth-compare-chart [data]="selectedUsersData()" />
    </div>

    <!-- display compare tables -->
    <div class="grid lg:grid-cols-2 xl:grid-cols-10 gap-x-4 gap-y-4 mb-10">
      <app-general-card title="State" class="lg:col-span-2 xl:col-span-4">
        <app-portfolio-state-table [data]="selectedUsersData()" />
      </app-general-card>

      <app-general-card title="Risk" class="xl:col-span-3">
        <app-portfolio-state-risk-table [data]="selectedUsersData()" />
      </app-general-card>

      <app-general-card title="Transactions" class="xl:col-span-3">
        <app-portfolio-state-transactions-table [data]="selectedUsersData()" />
      </app-general-card>
    </div>

    <div class="mb-4">
      <app-general-card title="Period Change">
        <app-portfolio-period-change-table [data]="selectedUsersData()" />
      </app-general-card>
    </div>
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
  private portfolioGrowthService = inject(PortfolioGrowthService);
  private portfolioCalculationService = inject(PortfolioCalculationService);
  private userApiService = inject(UserApiService);
  private dialogServiceUtil = inject(DialogServiceUtil);

  selectedUsers = signal<UserBase[]>([this.authenticationUserStoreService.state.getUserData()]);

  /**
   * load user data when selected users change
   */
  selectedUsersData = toSignal(
    toObservable(this.selectedUsers).pipe(
      mergeMap((users) =>
        forkJoin(
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
                  portfolioState: this.portfolioGrowthService
                    .getPortfolioStateHoldings(userTransactions.transactions, userData.portfolioState)
                    .pipe(take(1)),
                  portfolioGrowth: from(
                    this.portfolioGrowthService.getPortfolioGrowthAssets(userTransactions.transactions),
                  ).pipe(
                    map((portfolioGrowth) => this.portfolioCalculationService.getPortfolioGrowth(portfolioGrowth)),
                  ),
                }).pipe(
                  map((data) => ({
                    ...data,
                    portfolioChange: this.portfolioCalculationService.getPortfolioChange(data.portfolioGrowth),
                  })),
                ),
              ),
            ),
          ),
        ),
      ),
      catchError((error) => {
        this.dialogServiceUtil.handleError(error);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  selectedUsersDataEffect = effect(() => {
    console.log('selectedUsersData', this.selectedUsersData());
  });

  onUserClick(user: UserBase) {
    if (this.selectedUsers().length < 6) {
      this.selectedUsers.set([...this.selectedUsers(), user]);
    }
  }
}
