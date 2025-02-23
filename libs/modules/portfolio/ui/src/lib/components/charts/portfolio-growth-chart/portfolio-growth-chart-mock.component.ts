import { Component, input } from '@angular/core';
import { PortfolioGrowth, USER_DEFAULT_STARTING_CASH } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-growth-chart',
  standalone: true,
  template: '',
})
export class PortfolioGrowthChartComponentMock {
  readonly heightPx = input<number>(400);
  readonly headerTitle = input<string>('');
  readonly data = input<{
    values: PortfolioGrowth[] | null;
    currentCash?: number[];
  }>();

  readonly startCash = input(USER_DEFAULT_STARTING_CASH);
  readonly displayLegend = input(false);
  readonly displayHeader = input(true);
  readonly displayThreshold = input(true);
  readonly chartType = input<'all' | 'marketValue' | 'balance'>('all');

  /**
   * type of filter to use to compare date value
   * - date - compare by date
   * - round - compare by normal <= >= etc
   */
  readonly filterType = input<'date' | 'round'>('date');
}
