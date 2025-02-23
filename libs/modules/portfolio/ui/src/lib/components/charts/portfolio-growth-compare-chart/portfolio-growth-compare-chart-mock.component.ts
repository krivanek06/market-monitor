import { Component, input } from '@angular/core';
import { PortfolioGrowthCompareChartData } from './portfolio-growth-compare-chart.component';

@Component({
  selector: 'app-portfolio-growth-compare-chart',
  standalone: true,
  template: '',
})
export class PortfolioGrowthCompareChartComponentMock {
  readonly heightPx = input<number>(400);
  readonly data = input.required<PortfolioGrowthCompareChartData[]>();
  readonly title = input<string>('');

  /**
   * date - filter by date,
   * round - filter by index
   */
  readonly filterType = input<'date' | 'round'>('date');
}
