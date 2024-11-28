import { NgClass, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { UserApiService } from '@mm/api-client';
import { GROUP_HOLDING_LIMIT, GROUP_MEMBER_LIMIT, PortfolioGrowth, UserBase } from '@mm/api-types';
import { GroupInvitationsManagerComponent, GroupUserHasRoleDirective } from '@mm/group/features';
import { GroupDisplayInfoComponent, GroupMemberPortfolioHoldingChartComponent } from '@mm/group/ui';
import { SymbolSummaryDialogComponent } from '@mm/market-stocks/features';
import { PortfolioCalculationService } from '@mm/portfolio/data-access';
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
    NgClass,
    SlicePipe,
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
    SymbolSummaryDialogComponent,
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
      <div class="mb-6 flex flex-col items-center justify-between gap-x-10 gap-y-6 md:flex-row xl:justify-evenly">
        <!-- group info -->
        <app-group-display-info
          class="w-full md:max-xl:basis-3/5 xl:flex-1"
          (ownerClickEmitter)="onMemberClick($event)"
          [clickableOwner]="true"
          [imageHeightPx]="150"
          [groupData]="groupDetailsSignal.groupData"
        />

        <!-- portfolio info -->
        <app-portfolio-state
          class="w-full md:max-xl:basis-2/5 md:max-xl:pt-12 xl:flex-1"
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showCashSegment]="true"
          [portfolioState]="groupDetailsSignal.groupData.portfolioState"
        />

        <!-- portfolio chart -->
        <div class="hidden w-[440px] xl:block">
          <app-portfolio-balance-pie-chart [heightPx]="245" [data]="groupDetailsSignal.groupData.portfolioState" />
        </div>
      </div>

      <!-- divider -->
      <div class="mb-8 pt-4">
        <mat-divider />
      </div>

      <!-- portfolio change -->
      <div class="mb-12 lg:px-10">
        <app-portfolio-period-change [portfolioChange]="portfolioChangeSignal()" />
      </div>

      <!-- divider -->
      <div class="pb-4">
        <mat-divider />
      </div>

      <!-- growth chart -->
      <app-portfolio-growth-chart
        [data]="{
          values: portfolioGrowthSignal(),
          currentCash: portfolioGrowthCurrentCash(),
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

      <!-- charts -->
      @if (groupDetailsSignal.groupTransactionsData.length > 0) {
        <div #groupBubble class="mb-14 hidden gap-x-8 sm:flex">
          @if (portfolioHoldingBubbleChartSignal().length > 1) {
            <!-- bubble chart -->
            <div class="max-xl:flex-1 xl:basis-3/5">
              <app-generic-chart
                class="hidden w-full sm:block"
                chartType="packedbubble"
                [heightPx]="350"
                [series]="portfolioHoldingBubbleChartSignal()"
              />
            </div>

            <!-- sector allocation -->
            <div class="xl:basis-2/5">
              <app-pie-chart
                class="block max-xl:hidden"
                [heightPx]="300"
                [series]="portfolioSectorAllocationSignal()"
              />
            </div>
          } @else {
            <div class="g-skeleton h-[350px] xl:basis-3/5"></div>
            <div class="g-skeleton h-[350px] xl:basis-2/5"></div>
          }
        </div>
      }

      <!-- holding chart -->
      @defer (on viewport) {
        <app-section-title title="Group Symbol Holdings" matIcon="filter_list" class="mb-2" />
        @if (groupPortfolioStateHolding()?.holdings; as holdings) {
          <app-group-member-portfolio-holding-chart
            [heightPx]="400"
            [data]="holdings | slice: 0 : GROUP_HOLDING_LIMIT"
          />
        } @else {
          <div class="g-skeleton block h-[480px] max-xl:hidden"></div>
        }
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
        @defer (on idle) {
          <div class="grid grid-cols-2 gap-4">
            <!-- best returns -->
            <app-general-card title="Best Returns" matIcon="trending_up" class="max-lg:hidden">
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
            <app-general-card title="Worst Returns" matIcon="trending_down" class="max-lg:hidden">
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
        } @loading (minimum 1s) {
          <div class="grid grid-cols-2 gap-4">
            <div class="g-skeleton h-[750px]"></div>
            <div class="g-skeleton h-[750px]"></div>
          </div>
        }
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

  readonly portfolioCalculationService = inject(PortfolioCalculationService);
  readonly userApiService = inject(UserApiService);

  readonly portfolioSectorAllocationSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.getGroupHoldingsSignal()),
  );

  readonly portfolioHoldingBubbleChartSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioHoldingBubbleChart(this.getGroupHoldingsSignal()),
  );

  readonly memberRequestedUsersSignal = derivedFrom(
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

  readonly memberInvitedUsersSignal = derivedFrom(
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

  readonly portfolioGrowthSignal = computed(() =>
    (this.groupDetailsSignal()?.groupPortfolioSnapshotsData ?? []).map(
      (portfolioStatePerDay) =>
        ({
          date: portfolioStatePerDay.date,
          investedTotal: portfolioStatePerDay.invested,
          marketTotal: portfolioStatePerDay.holdingsBalance,
          balanceTotal: portfolioStatePerDay.balance,
        }) satisfies PortfolioGrowth,
    ),
  );

  readonly portfolioGrowthCurrentCash = computed(() =>
    (this.groupDetailsSignal()?.groupPortfolioSnapshotsData ?? []).map(
      (portfolioStatePerDay) => portfolioStatePerDay.startingCash,
    ),
  );

  readonly portfolioChangeSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.portfolioGrowthSignal()),
  );

  readonly displayEveryMember = signal(false);
  readonly displayedMembers = computed(() =>
    this.displayEveryMember()
      ? this.groupDetailsSignal()?.groupMembersData
      : this.groupDetailsSignal()?.groupMembersData?.slice(0, this.displayLimitInitial),
  );

  readonly displayedColumns = ['symbol', 'transactionType', 'totalValue', 'unitPrice', 'units', 'returnPrct', 'date'];

  onMemberClick(member: UserBase): void {
    this.dialog.open(UserDetailsDialogComponent, {
      data: <UserDetailsDialogComponentData>{
        userId: member.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
