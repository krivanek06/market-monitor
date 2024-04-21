import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PortfolioStateHoldings, UserData } from '@mm/api-types';
import { PortfolioGrowth } from '@mm/portfolio/data-access';
import { PortfolioGrowthChartComponent, PortfolioHoldingsTableComponent } from '@mm/portfolio/ui';
import { SectionTitleComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-user-details-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioGrowthChartComponent,
    MatProgressSpinner,
    PortfolioHoldingsTableComponent,
    SectionTitleComponent,
  ],
  template: `
    <!-- portfolio growth charts -->
    @if (portfolioGrowth(); as portfolioGrowth) {
      <app-portfolio-growth-chart
        headerTitle="Portfolio Growth"
        chartType="balance"
        [displayHeader]="true"
        [displayLegend]="true"
        [data]="{
          values: portfolioGrowth,
          startingCashValue: userData().portfolioState.startingCash
        }"
        [heightPx]="375"
        class="mb-6"
      ></app-portfolio-growth-chart>
    } @else {
      <div class="h-[400px] grid place-content-center">
        <mat-spinner></mat-spinner>
      </div>
    }

    <div class="max-sm:pl-2 mb-6">
      <app-section-title [title]="'Holdings: ' + (portfolioStateHolding()?.holdings ?? []).length" class="mb-3" />
      <app-portfolio-holdings-table
        [holdings]="portfolioStateHolding()?.holdings ?? []"
        [portfolioState]="portfolioStateHolding()"
        [displayedColumns]="displayedColumns"
        [showSkeletonLoading]="!portfolioStateHolding()?.holdings"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsPortfolioComponent {
  portfolioGrowth = input.required<PortfolioGrowth[] | null>();
  userData = input.required<UserData>();
  portfolioStateHolding = input<PortfolioStateHoldings>();

  displayedColumns: string[] = ['symbol', 'price', 'balance', 'invested', 'totalChange', 'portfolio', 'marketCap'];
}
