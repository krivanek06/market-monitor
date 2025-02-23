import { Component, input } from '@angular/core';
import { PortfolioGrowth } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-change-chart',
  standalone: true,
  template: '',
})
export class PortfolioChangeChartComponentMock {
  readonly heightPx = input<number>(400);
  readonly data = input.required<PortfolioGrowth[] | null>();
}
