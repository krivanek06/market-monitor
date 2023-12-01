import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';
import { GroupApiService, UserApiService } from '@market-monitor/api-client';
import { GroupInvitationsManagerComponent } from '@market-monitor/modules/group/features';
import { GroupDisplayInfoComponent } from '@market-monitor/modules/group/ui';
import { PortfolioCalculationService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioBalancePieChartComponent,
  PortfolioGrowthChartComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { map, switchMap } from 'rxjs';

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
export class GroupDetailsOverviewComponent implements OnInit {
  groupApiService = inject(GroupApiService);
  portfolioCalculationService = inject(PortfolioCalculationService);
  userApiService = inject(UserApiService);

  groupDetails$ = inject(ActivatedRoute).params.pipe(
    map((d) => d['id']),
    switchMap((id) => this.groupApiService.getGroupDetailsById(id)),
  );
  groupDetailsSignal = toSignal(this.groupDetails$);

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
      this.groupDetailsSignal()?.groupPortfolioSnapshotsData?.data ?? [],
    ),
  );
  portfolioChangeSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.portfolioGrowthSignal()),
  );

  ColorScheme = ColorScheme;

  ngOnInit(): void {}
}
