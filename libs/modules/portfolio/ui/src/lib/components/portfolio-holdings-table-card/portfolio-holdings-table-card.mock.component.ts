import { Component, input } from '@angular/core';
import { PortfolioStateHoldings } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-holdings-table-card',
  standalone: true,
  template: ``,
})
export class PortfolioHoldingsTableCardComponentMock {
  portfolioStateHolding = input<PortfolioStateHoldings>();
}
