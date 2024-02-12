import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UserApiService } from '@market-monitor/api-client';
import { GROUP_MEMBER_LIMIT, UserBase } from '@market-monitor/api-types';
import { GroupInvitationsManagerComponent, GroupUserHasRoleDirective } from '@market-monitor/modules/group/features';
import { GroupDisplayInfoComponent } from '@market-monitor/modules/group/ui';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioCalculationService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioBalancePieChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
} from '@market-monitor/modules/portfolio/ui';
import { UserDetailsDialogComponent, UserDetailsDialogComponentData } from '@market-monitor/modules/user/features';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import {
  GeneralCardComponent,
  PositionCardComponent,
  SectionTitleComponent,
  SortByKeyPipe,
} from '@market-monitor/shared/ui';
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
      ></app-portfolio-growth-chart>

      <!-- invitations -->
      <app-group-invitations-manager
        *appGroupUserHasRole="groupDetailsSignal.groupData.id; include: ['groupOwner']"
        class="mb-6"
        [groupData]="groupDetailsSignal"
        [memberRequestUsers]="memberRequestedUsersSignal()"
        [memberInvitedUsers]="memberInvitedUsersSignal()"
      ></app-group-invitations-manager>

      <!-- member -->
      <div class="grid gap-4 mb-10">
        <app-section-title
          title="Members [{{ groupDetailsSignal.groupData.memberUserIds.length }} / {{ GROUP_MEMBER_LIMIT }}]"
          matIcon="group"
        />
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
          @for (user of groupDetailsSignal.groupMembersData; track user.id) {
            <app-position-card
              (clickedEmitter)="onMemberClick(user)"
              [clickable]="true"
              [currentPositions]="user.position.currentGroupMemberPosition"
              [previousPosition]="user.position.previousGroupMemberPosition"
            >
              <app-user-display-item [userData]="user"></app-user-display-item>
            </app-position-card>
          }
        </div>
      </div>

      <!-- holding table -->
      <app-general-card title="Holdings" titleScale="large" matIcon="show_chart">
        <app-portfolio-holdings-table
          (symbolClicked)="onSummaryClick($event)"
          [holdings]="getGroupHoldingsSignal()"
          [holdingsBalance]="groupDetailsSignal.groupData.portfolioState.holdingsBalance"
        ></app-portfolio-holdings-table>
      </app-general-card>
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
    this.portfolioCalculationService.getPortfolioGrowthFromPortfolioState(
      this.groupDetailsSignal()?.groupPortfolioSnapshotsData ?? [],
    ),
  );
  portfolioChangeSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.portfolioGrowthSignal()),
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
