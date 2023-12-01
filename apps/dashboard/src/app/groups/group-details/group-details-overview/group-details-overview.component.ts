import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { GroupDetails } from '@market-monitor/api-types';
import { GroupDisplayInfoComponent } from '@market-monitor/modules/group/ui';
import { PortfolioCalculationService, PortfolioGrowth } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioBalancePieChartComponent,
  PortfolioPeriodChangeComponent,
  PortfolioStateComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';

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
  @Input({ required: true }) groupDetails!: GroupDetails;

  portfolioCalculationService = inject(PortfolioCalculationService);

  portfolioGrowthSignal = signal<PortfolioGrowth[]>([]);
  portfolioChangeSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.portfolioGrowthSignal()),
  );

  ColorScheme = ColorScheme;

  ngOnInit(): void {
    // TODO: input should be signal, it fails because groupDetails is null
    const calculation = this.portfolioCalculationService.getPortfolioGrowthFromPortfolioState(
      this.groupDetails.groupPortfolioSnapshotsData.data,
    );
    this.portfolioGrowthSignal.set(calculation);
  }
}
