import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PortfolioStateHoldings, UserData } from '@mm/api-types';
import { PortfolioGrowth } from '@mm/portfolio/data-access';
import {
  PortfolioGrowthChartComponent,
  PortfolioHoldingsTableCardComponent,
  PortfolioHoldingsTableComponent,
} from '@mm/portfolio/ui';
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
    PortfolioHoldingsTableCardComponent,
  ],
  template: `
    <!-- portfolio growth charts -->
    @if (portfolioGrowth(); as portfolioGrowth) {
      <app-portfolio-growth-chart
        headerTitle="Portfolio Growth"
        chartType="balance"
        [displayLegend]="true"
        [data]="{
          values: portfolioGrowth,
          startingCashValue: userData().portfolioState.startingCash,
        }"
        [heightPx]="375"
        class="mb-6"
      ></app-portfolio-growth-chart>
    } @else {
      <div class="grid h-[400px] place-content-center">
        <mat-spinner></mat-spinner>
      </div>
    }

    <div class="mb-6 max-sm:pl-2">
      <app-portfolio-holdings-table-card
        [displayedColumns]="displayedColumns"
        [portfolioStateHolding]="portfolioStateHolding()"
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
