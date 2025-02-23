import { Component, input } from '@angular/core';
import { PortfolioTransaction } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-asset-chart',
  standalone: true,
  template: '',
})
export class PortfolioAssetChartComponentMock {
  readonly heightPx = input<number>(400);
  readonly data = input<PortfolioTransaction[] | null>([]);
}
