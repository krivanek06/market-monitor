import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UserApiService } from '@mm/api-client';
import { GROUP_MEMBER_LIMIT, UserBase } from '@mm/api-types';
import { GroupInvitationsManagerComponent, GroupUserHasRoleDirective } from '@mm/group/features';
import { GroupDisplayInfoComponent } from '@mm/group/ui';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioCalculationService, PortfolioGrowth } from '@mm/portfolio/data-access';
import {
  PortfolioBalancePieChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioTransactionChartComponent,
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
import { computedFrom } from 'ngxtension/computed-from';
import { filterNil } from 'ngxtension/filter-nil';
import { map, pipe, switchMap } from 'rxjs';
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
    PortfolioHoldingsTableComponent,
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
  ],
  template: `
    <ng-container *ngIf="groupDetailsSignal() as groupDetailsSignal">
      <div class="flex flex-col justify-between mb-6 lg:flex-row gap-x-10 gap-y-6">
        <!-- group info -->
        <app-group-display-info
          class="flex-1"
          (ownerClickEmitter)="onMemberClick($event)"
          [clickableOwner]="true"
          [imageHeightPx]="150"
          [groupData]="groupDetailsSignal.groupData"
        ></app-group-display-info>

        <!-- portfolio info -->
        <app-portfolio-state
          class="flex-1"
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showCashSegment]="true"
          [portfolioState]="groupDetailsSignal.groupData.portfolioState"
        ></app-portfolio-state>

        <!-- portfolio chart -->
        <div class="-mt-10 w-[420px] hidden xl:block">
          <app-portfolio-balance-pie-chart
            [heightPx]="260"
            [data]="groupDetailsSignal.groupData.portfolioState"
          ></app-portfolio-balance-pie-chart>
        </div>
      </div>

      <!-- divider -->
      <div class="pt-4 mb-8">
        <mat-divider></mat-divider>
      </div>

      <!-- portfolio change -->
      <div class="mb-12 lg:px-10">
        <app-portfolio-period-change
          *ngIf="portfolioChangeSignal() as portfolioChange"
          [portfolioChange]="portfolioChange"
        ></app-portfolio-period-change>
      </div>

      <!-- divider -->
      <div class="pb-4">
        <mat-divider></mat-divider>
      </div>

      <app-portfolio-growth-chart
        *ngIf="portfolioGrowthSignal() as portfolioGrowthChartSignal"
        [data]="{
          values: portfolioGrowthChartSignal,
          startingCashValue: groupDetailsSignal.groupData.portfolioState.startingCash
        }"
        [heightPx]="425"
        class="mb-6"
        chartType="balance"
        [displayHeader]="true"
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
      <div *ngIf="groupDetailsSignal.groupMembersData.length > 0" class="grid gap-4 mb-12">
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
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (user of displayedMembers(); track user.id; let i = $index) {
            <app-position-card
              (clickedEmitter)="onMemberClick(user)"
              [clickable]="true"
              [currentPositions]="i + 1"
              [previousPosition]="user.position.previousGroupMemberPosition"
              class="g-clickable-hover"
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

      <div
        *ngIf="groupDetailsSignal.groupTransactionsData.length > 0"
        class="sm:grid mb-12 xl:grid-cols-2 gap-x-4 hidden"
      >
        @if (portfolioHoldingBubbleChartSignal().length > 1) {
          <!-- bubble chart -->
          <app-generic-chart
            class="hidden sm:block w-full"
            chartType="packedbubble"
            [heightPx]="380"
            [series]="portfolioHoldingBubbleChartSignal()"
          />

          <!-- sector allocation -->
          <app-pie-chart
            class="block max-xl:hidden"
            *ngIf="portfolioSectorAllocationSignal() as portfolioSectorAllocation"
            [heightPx]="380"
            chartTitle="Sector Allocation"
            [series]="portfolioSectorAllocation"
          />
        } @else {
          <div class="g-skeleton h-[300px]"></div>
          <div class="g-skeleton h-[300px]"></div>
        }
      </div>

      <!-- holding table -->
      <div class="mb-10">
        <app-general-card [title]="'Holdings: ' + getGroupHoldingsSignal().length" matIcon="show_chart">
          <app-portfolio-holdings-table
            (symbolClicked)="onSummaryClick($event)"
            [holdings]="displayedHoldings()"
            [portfolioState]="groupDetailsSignal.groupData.portfolioState"
          />
          <!-- show more button -->
          <div class="flex justify-end mt-2 mr-4">
            <app-show-more-button
              [(showMoreToggle)]="displayEveryHolding"
              [itemsLimit]="displayLimitInitial"
              [itemsTotal]="getGroupHoldingsSignal().length"
              [allowShowLess]="false"
            />
          </div>
        </app-general-card>
      </div>

      <!-- transaction chart -->
      <div *ngIf="groupDetailsSignal.groupTransactionsData.length > 5" class="mb-6">
        <app-section-title title="Last Transactions" matIcon="history" />
        <app-portfolio-transaction-chart [data]="groupDetailsSignal.groupPortfolioSnapshotsData" />
      </div>

      <!-- transactions -->
      <div *ngIf="groupDetailsSignal.groupTransactionsData.length > 0">
        <app-section-title title="Last Transactions" matIcon="history" additionalClasses="pl-1 mb-3" />
        <app-portfolio-transactions-table
          [showTransactionFees]="true"
          [showUser]="true"
          [data]="groupDetailsSignal.groupTransactionsData | sortByKey: 'date' : 'desc'"
        />
      </div>
    </ng-container>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsOverviewComponent extends PageGroupsBaseComponent implements OnInit {
  GROUP_MEMBER_LIMIT = GROUP_MEMBER_LIMIT;
  portfolioCalculationService = inject(PortfolioCalculationService);
  userApiService = inject(UserApiService);

  portfolioSectorAllocationSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.getGroupHoldingsSignal()),
  );

  portfolioHoldingBubbleChartSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioHoldingBubbleChart(this.getGroupHoldingsSignal()),
  );

  memberRequestedUsersSignal = computedFrom(
    [this.groupDetailsSignal],
    pipe(
      map(([group]) => group),
      filterNil(),
      switchMap((group) => this.userApiService.getUsersByIds(group.groupData.memberRequestUserIds)),
    ),
    { initialValue: [] },
  );

  memberInvitedUsersSignal = computedFrom(
    [this.groupDetailsSignal],
    pipe(
      map(([group]) => group),
      filterNil(),
      switchMap((group) => this.userApiService.getUsersByIds(group.groupData.memberInvitedUserIds)),
    ),
    { initialValue: [] },
  );

  portfolioGrowthSignal = computed(() =>
    (this.groupDetailsSignal()?.groupPortfolioSnapshotsData ?? []).map(
      (portfolioStatePerDay) =>
        ({
          date: portfolioStatePerDay.date,
          investedValue: portfolioStatePerDay.invested,
          marketTotalValue: portfolioStatePerDay.holdingsBalance,
          totalBalanceValue: portfolioStatePerDay.balance,
        }) satisfies PortfolioGrowth,
    ),
  );

  portfolioChangeSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.portfolioGrowthSignal()),
  );

  displayLimitInitial = 12;

  /**
   * whether to display all holdings or only the first N
   */
  displayEveryHolding = signal(false);
  displayedHoldings = computed(() =>
    this.displayEveryHolding()
      ? this.getGroupHoldingsSignal()
      : this.getGroupHoldingsSignal().slice(0, this.displayLimitInitial),
  );

  displayEveryMember = signal(false);
  displayedMembers = computed(() =>
    this.displayEveryMember()
      ? this.groupDetailsSignal()?.groupMembersData
      : this.groupDetailsSignal()?.groupMembersData?.slice(0, this.displayLimitInitial),
  );

  ColorScheme = ColorScheme;

  ngOnInit(): void {}

  onMemberClick(member: UserBase): void {
    this.dialog.open(UserDetailsDialogComponent, {
      data: <UserDetailsDialogComponentData>{
        userId: member.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
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
