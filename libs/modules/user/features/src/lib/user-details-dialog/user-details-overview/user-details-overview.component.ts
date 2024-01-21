import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { UserData } from '@market-monitor/api-types';
import { PortfolioGrowth } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { GenericChartComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-user-details-overview',
  imports: [
    CommonModule,
    PortfolioGrowthChartComponent,
    PortfolioStateComponent,
    PortfolioStateRiskComponent,
    PortfolioStateTransactionsComponent,
    GenericChartComponent,
    MatDividerModule,
  ],
  template: `
    <div class="pb-2">
      <mat-divider></mat-divider>
    </div>
    <!-- display portfolio -->
    <div class="flex p-2 sm:divide-x-2 flex-row">
      <!-- portfolio state -->
      <div class="p-6 max-lg:flex-1 lg:basis-[40%]">
        <app-portfolio-state
          [titleColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [portfolioState]="userData.portfolioState"
          [showCashSegment]="!!userData.features.allowPortfolioCashAccount"
        ></app-portfolio-state>
      </div>
      <!-- risk -->
      <div class="flex-1 p-6 hidden sm:block">
        <app-portfolio-state-risk
          [titleColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [portfolioState]="userData.portfolioState"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
        ></app-portfolio-state-risk>
      </div>
      <!-- transactions -->
      <div class="flex-1 p-6 hidden lg:block">
        <app-portfolio-state-transactions
          [portfolioState]="userData.portfolioState"
          [titleColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showFees]="!!userData.features.allowPortfolioCashAccount"
        >
        </app-portfolio-state-transactions>
      </div>
    </div>

    <div class="py-2">
      <mat-divider></mat-divider>
    </div>

    <!-- portfolio growth charts -->
    <div>
      <app-portfolio-growth-chart
        headerTitle="Portfolio Growth"
        chartType="balance"
        [displayHeader]="true"
        [displayLegend]="true"
        [data]="{
          values: portfolioGrowth,
          startingCashValue: userData.portfolioState.startingCash
        }"
        [heightPx]="375"
        class="mb-6"
      ></app-portfolio-growth-chart>
    </div>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsOverviewComponent implements OnInit {
  @Input({ required: true }) userData!: UserData;
  @Input({ required: true }) portfolioGrowth!: PortfolioGrowth[];
  ColorScheme = ColorScheme;
  constructor() {}

  ngOnInit() {}
}
