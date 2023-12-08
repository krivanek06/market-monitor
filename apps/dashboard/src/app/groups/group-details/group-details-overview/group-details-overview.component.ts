import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UserApiService } from '@market-monitor/api-client';
import { GROUP_MEMBER_LIMIT, GroupMember } from '@market-monitor/api-types';
import { GroupInvitationsManagerComponent, GroupUserHasRoleDirective } from '@market-monitor/modules/group/features';
import { GroupDisplayInfoComponent } from '@market-monitor/modules/group/ui';
import { PortfolioCalculationService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioBalancePieChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
  PortfolioTransactionsTableComponent,
} from '@market-monitor/modules/portfolio/ui';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { PositionCardComponent, SectionTitleComponent, SortByKeyPipe } from '@market-monitor/shared/ui';
import { switchMap } from 'rxjs';
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
    PortfolioTransactionsTableComponent,
    MatIconModule,
    SortByKeyPipe,
    SectionTitleComponent,
    GroupUserHasRoleDirective,
  ],
  templateUrl: './group-details-overview.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsOverviewComponent extends PageGroupsBaseComponent implements OnInit {
  GROUP_MEMBER_LIMIT = GROUP_MEMBER_LIMIT;
  portfolioCalculationService = inject(PortfolioCalculationService);
  userApiService = inject(UserApiService);

  memberRequestedUsersSignal = toSignal(
    this.groupDetails$.pipe(
      switchMap((group) => this.userApiService.getUsersByIds(group.groupData.memberRequestUserIds)),
    ),
    { initialValue: [] },
  );
  memberInvitedUsersSignal = toSignal(
    this.groupDetails$.pipe(
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

  onMemberClick(member: GroupMember): void {
    console.log('onMemberClick', member);
  }
}
