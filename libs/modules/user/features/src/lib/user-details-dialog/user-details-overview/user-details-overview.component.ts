import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { PortfolioStateHoldings, UserData } from '@market-monitor/api-types';
import { PortfolioGrowth } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableComponent,
  PortfolioStateComponent,
  PortfolioStateRiskComponent,
  PortfolioStateTransactionsComponent,
} from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { GenericChartComponent, SectionTitleComponent } from '@market-monitor/shared/ui';

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
    PortfolioHoldingsTableComponent,
    SectionTitleComponent,
  ],
  template: `
    <div class="pb-2">
      <mat-divider></mat-divider>
    </div>
    <!-- display portfolio -->
    <div class="flex p-2 divide-x-2 flex-row">
      <!-- portfolio state -->
      <div class="p-2 max-lg:flex-1 lg:basis-[40%]">
        <app-portfolio-state
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [portfolioState]="userData().portfolioState"
          [showCashSegment]="!!userData().features.allowPortfolioCashAccount"
        ></app-portfolio-state>
      </div>
      <!-- risk -->
      <div class="p-2 flex-1 hidden md:block">
        <app-portfolio-state-risk
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [portfolioState]="userData().portfolioState"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
        ></app-portfolio-state-risk>
      </div>
      <!-- transactions -->
      <div class="p-2 flex-1 hidden lg:block">
        <app-portfolio-state-transactions
          [portfolioState]="userData().portfolioState"
          [titleColor]="ColorScheme.GRAY_DARK_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showFees]="!!userData().features.allowPortfolioCashAccount"
        >
        </app-portfolio-state-transactions>
      </div>
    </div>

    <div class="py-2 max-md:mb-2">
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
          values: portfolioGrowth(),
          startingCashValue: userData().portfolioState.startingCash
        }"
        [heightPx]="375"
        class="mb-6"
      ></app-portfolio-growth-chart>
    </div>

    <div class="max-sm:pl-2">
      <app-section-title [title]="'Holdings: ' + (holdings()?.holdings ?? []).length" />
      <app-portfolio-holdings-table
        [holdings]="holdings()?.holdings ?? []"
        [holdingsBalance]="holdings()?.holdingsBalance ?? 0"
        [displayedColumns]="displayedColumns"
      ></app-portfolio-holdings-table>
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
  userData = input.required<UserData>();
  portfolioGrowth = input<PortfolioGrowth[]>([]);
  holdings = input<PortfolioStateHoldings>();

  ColorScheme = ColorScheme;
  displayedColumns: string[] = ['symbol', 'price', 'balance', 'invested', 'totalChange', 'portfolio', 'marketCap'];
  constructor() {}

  ngOnInit() {}
}
