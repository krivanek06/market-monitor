import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { UserApiService } from '@mm/api-client';
import { GROUP_HOLDING_LIMIT, GROUP_MEMBER_LIMIT, UserBase } from '@mm/api-types';
import { GroupInvitationsManagerComponent, GroupUserHasRoleDirective } from '@mm/group/features';
import { GroupDisplayInfoComponent, GroupMemberPortfolioHoldingChartComponent } from '@mm/group/ui';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioCalculationService, PortfolioGrowth } from '@mm/portfolio/data-access';
import {
  PortfolioBalancePieChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioTransactionChartComponent,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  GeneralCardComponent,
  GenericChartComponent,
  PieChartComponent,
  PositionCardComponent,
  SectionTitleComponent,
  ShowMoreButtonComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';
import { UserDetailsDialogComponent, UserDetailsDialogComponentData } from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { derivedFrom } from 'ngxtension/derived-from';
import { filterNil } from 'ngxtension/filter-nil';
import { map, pipe, switchMap, take } from 'rxjs';
import { PageGroupsBaseComponent } from '../page-groups-base.component';

@Component({
  selector: 'app-group-details-overview',
  standalone: true,
  imports: [
    CommonModule,
    GroupDisplayInfoComponent,
    PortfolioBalancePieChartComponent,
    PortfolioStateComponent,
    PortfolioPeriodChangeComponent,
    MatDividerModule,
    PortfolioGrowthChartComponent,
    GroupInvitationsManagerComponent,
    PositionCardComponent,
    UserDisplayItemComponent,
    PortfolioHoldingsTableCardComponent,
    MatIconModule,
    SortByKeyPipe,
    SectionTitleComponent,
    GroupUserHasRoleDirective,
    UserDetailsDialogComponent,
    GeneralCardComponent,
    StockSummaryDialogComponent,
    PieChartComponent,
    GenericChartComponent,
    PortfolioTransactionsTableComponent,
    PortfolioTransactionChartComponent,
    MatButtonModule,
    ShowMoreButtonComponent,
    MatTabsModule,
    PortfolioTransactionsItemComponent,
    GroupMemberPortfolioHoldingChartComponent,
  ],
  template: `
    @if (groupDetailsSignal(); as groupDetailsSignal) {
      <div class="mb-6 flex flex-col justify-between gap-x-10 gap-y-6 lg:flex-row">
        <!-- group info -->
        <app-group-display-info
          class="flex-1"
          (ownerClickEmitter)="onMemberClick($event)"
          [clickableOwner]="true"
          [imageHeightPx]="150"
          [groupData]="groupDetailsSignal.groupData"
        />

        <!-- portfolio info -->
        <app-portfolio-state
          class="flex-1"
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showCashSegment]="true"
          [portfolioState]="groupDetailsSignal.groupData.portfolioState"
        />

        <!-- portfolio chart -->
        <div class="-mt-10 hidden w-[420px] xl:block">
          <app-portfolio-balance-pie-chart [heightPx]="260" [data]="groupDetailsSignal.groupData.portfolioState" />
        </div>
      </div>

      <!-- divider -->
      <div class="mb-8 pt-4">
        <mat-divider />
      </div>

      <!-- portfolio change -->
      <div class="mb-12 lg:px-10">
        <app-portfolio-period-change
          *ngIf="portfolioChangeSignal() as portfolioChange"
          [portfolioChange]="portfolioChange"
        />
      </div>

      <!-- divider -->
      <div class="pb-4">
        <mat-divider />
      </div>

      <!-- growth chart -->
      <app-portfolio-growth-chart
        [data]="{
          values: portfolioGrowthSignal(),
        }"
        [heightPx]="425"
        class="mb-6"
        chartType="balance"
        [displayLegend]="true"
        headerTitle="Portfolio Growth"
      />

      <!-- invitations -->
      <app-group-invitations-manager
        *appGroupUserHasRole="groupDetailsSignal.groupData.id; include: ['groupOwner']"
        class="mb-6"
        [groupData]="groupDetailsSignal"
        [memberRequestUsers]="memberRequestedUsersSignal()"
        [memberInvitedUsers]="memberInvitedUsersSignal()"
      />

      <!-- member -->
      @if (groupDetailsSignal.groupMembersData.length > 0) {
        <div class="mb-12 grid gap-4">
          <div class="flex items-center justify-between">
            <app-section-title
              title="Members [{{ groupDetailsSignal.groupMembersData.length }} / {{ GROUP_MEMBER_LIMIT }}]"
              matIcon="group"
            />
            <!-- show more members button -->
            <app-show-more-button
              class="hidden sm:block"
              [(showMoreToggle)]="displayEveryMember"
              [itemsLimit]="displayLimitInitial"
              [itemsTotal]="groupDetailsSignal.groupMembersData.length"
            />
          </div>
          <!-- member list -->
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (user of displayedMembers(); track user.id; let i = $index) {
              <app-position-card
                (itemClicked)="onMemberClick(user)"
                [clickable]="true"
                [currentPositions]="i + 1"
                [previousPosition]="user.position.previousGroupMemberPosition"
              >
                <app-user-display-item [userData]="user" />
              </app-position-card>
            }
          </div>
          <!-- show more members button -->
          <div class="flex justify-end">
            <app-show-more-button
              class="block sm:hidden"
              [(showMoreToggle)]="displayEveryMember"
              [itemsLimit]="displayLimitInitial"
              [itemsTotal]="groupDetailsSignal.groupMembersData.length"
            />
          </div>
        </div>
      }

      @if (groupDetailsSignal.groupTransactionsData.length > 0) {
        <div #groupBubble class="mb-12 hidden gap-x-4 sm:grid xl:grid-cols-2">
          @if (portfolioHoldingBubbleChartSignal().length > 1) {
            <!-- bubble chart -->
            <div>
              @defer (on viewport(groupBubble)) {
                <app-generic-chart
                  class="hidden w-full sm:block"
                  chartType="packedbubble"
                  [heightPx]="380"
                  [series]="portfolioHoldingBubbleChartSignal()"
                />
              } @loading (minimum 1s) {
                <div class="g-skeleton hidden h-[350px] sm:block"></div>
              }
            </div>

            <!-- sector allocation -->
            <div>
              @defer (on viewport(groupBubble)) {
                <app-pie-chart
                  class="block max-xl:hidden"
                  *ngIf="portfolioSectorAllocationSignal() as portfolioSectorAllocation"
                  [heightPx]="380"
                  chartTitle="Sector Allocation"
                  [series]="portfolioSectorAllocation"
                />
              } @loading (minimum 1s) {
                <div class="g-skeleton block h-[350px] max-xl:hidden"></div>
              }
            </div>
          } @else {
            <div class="g-skeleton h-[350px]"></div>
            <div class="g-skeleton h-[350px]"></div>
          }
        </div>
      }

      @defer (on viewport) {
        <!-- holding chart -->
        <app-section-title title="Group Symbol Holdings - top 25" matIcon="filter_list" class="mb-2" />
        <app-group-member-portfolio-holding-chart
          [heightPx]="500"
          [data]="groupPortfolioStateHolding()?.holdings ?? [] | slice: 0 : 25"
        />
      } @placeholder {
        <div class="g-skeleton block h-[500px] max-xl:hidden"></div>
      } @loading (minimum 1s) {
        <div class="g-skeleton block h-[500px] max-xl:hidden"></div>
      }

      <!-- holding table -->
      <div class="mb-10">
        <app-portfolio-holdings-table-card
          [maximumHoldingLimit]="GROUP_HOLDING_LIMIT"
          [portfolioStateHolding]="groupPortfolioStateHolding()"
        />
      </div>

      <!-- transaction chart -->
      @if (groupDetailsSignal.groupPortfolioSnapshotsData.length > 5) {
        <div class="mb-8">
          <app-section-title title="Last Transactions" matIcon="history" />
          <app-portfolio-transaction-chart [data]="groupDetailsSignal.groupPortfolioSnapshotsData" />
        </div>
      }

      <!-- transactions -->
      @if (groupDetailsSignal.groupTransactionsData.length > 0) {
        <div>
          @defer (on idle) {
            <mat-tab-group class="hidden lg:block" mat-stretch-tabs="false" mat-align-tabs="end">
              <!-- last transactions -->
              <mat-tab label="Last Transactions">
                <app-portfolio-transactions-table
                  [showTransactionFees]="true"
                  [showUser]="true"
                  [data]="groupDetailsSignal.groupTransactionsData"
                />
              </mat-tab>
              <!-- best / worst transactions -->
              <mat-tab label="Top Transactions">
                <div class="flex gap-4">
                  <!-- best returns -->
                  <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
                    @for (
                      item of groupDetailsSignal.groupTransactionsDataBest | slice: 0 : 12;
                      track item.transactionId;
                      let last = $last
                    ) {
                      <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                        <app-portfolio-transactions-item [transaction]="item" [displayUser]="true" />
                      </div>
                    }
                  </app-general-card>

                  <!-- worst returns -->
                  <app-general-card title="Worst Returns" matIcon="trending_down" class="flex-1">
                    @for (
                      item of groupDetailsSignal.groupTransactionsDataWorst | slice: 0 : 12;
                      track item.transactionId;
                      let last = $last
                    ) {
                      <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                        <app-portfolio-transactions-item [transaction]="item" [displayUser]="true" />
                      </div>
                    }
                  </app-general-card>
                </div>
              </mat-tab>
            </mat-tab-group>

            <!-- transaction table on smaller screen -->
            <app-portfolio-transactions-table
              class="block lg:hidden"
              [showTransactionFees]="true"
              [showUser]="true"
              [data]="groupDetailsSignal.groupTransactionsData"
            />
          } @loading (minimum 1s) {
            <div class="mb-4 flex justify-between">
              <div class="g-skeleton h-10 w-[220px]"></div>

              <div class="flex gap-2">
                <div class="g-skeleton h-10 w-[220px]"></div>
                <div class="g-skeleton h-10 w-[220px]"></div>
              </div>
            </div>
            <div class="g-skeleton h-[600px]"></div>
          }
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsOverviewComponent extends PageGroupsBaseComponent {
  readonly GROUP_MEMBER_LIMIT = GROUP_MEMBER_LIMIT;
  readonly GROUP_HOLDING_LIMIT = GROUP_HOLDING_LIMIT;
  readonly ColorScheme = ColorScheme;
  readonly displayLimitInitial = 12;

  portfolioCalculationService = inject(PortfolioCalculationService);
  userApiService = inject(UserApiService);

  portfolioSectorAllocationSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.getGroupHoldingsSignal()),
  );

  portfolioHoldingBubbleChartSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioHoldingBubbleChart(this.getGroupHoldingsSignal()),
  );

  memberRequestedUsersSignal = derivedFrom(
    [this.groupDetailsSignal],
    pipe(
      map(([group]) => group),
      filterNil(),
      switchMap((group) =>
        this.userApiService.getUsersByIds(group.groupData.memberRequestUserIds).pipe(
          // prevent listening on user document changes
          take(1),
        ),
      ),
    ),
    { initialValue: [] },
  );

  memberInvitedUsersSignal = derivedFrom(
    [this.groupDetailsSignal],
    pipe(
      map(([group]) => group),
      filterNil(),
      switchMap((group) =>
        this.userApiService.getUsersByIds(group.groupData.memberInvitedUserIds).pipe(
          // prevent listening on user document changes
          take(1),
        ),
      ),
    ),
    { initialValue: [] },
  );

  portfolioGrowthSignal = computed(() =>
    (this.groupDetailsSignal()?.groupPortfolioSnapshotsData ?? []).map(
      (portfolioStatePerDay) =>
        ({
          date: portfolioStatePerDay.date,
          breakEvenValue: portfolioStatePerDay.invested,
          marketTotalValue: portfolioStatePerDay.holdingsBalance,
          totalBalanceValue: portfolioStatePerDay.balance,
          startingCash: portfolioStatePerDay.startingCash,
        }) satisfies PortfolioGrowth,
    ),
  );

  portfolioChangeSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.portfolioGrowthSignal()),
  );

  displayEveryMember = signal(false);
  displayedMembers = computed(() =>
    this.displayEveryMember()
      ? this.groupDetailsSignal()?.groupMembersData
      : this.groupDetailsSignal()?.groupMembersData?.slice(0, this.displayLimitInitial),
  );

  onMemberClick(member: UserBase): void {
    this.dialog.open(UserDetailsDialogComponent, {
      data: <UserDetailsDialogComponentData>{
        userId: member.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
