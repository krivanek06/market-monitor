import { Component, input, output } from '@angular/core';
import { PortfolioState, PortfolioStateHolding } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-holdings-table',
  standalone: true,
  template: ``,
})
export class PortfolioHoldingsTableComponentMock {
  symbolClicked = output<string>();
  holdings = input<PortfolioStateHolding[]>();
  portfolioState = input<PortfolioState>();
  displayedColumns = input<string[]>();
}
