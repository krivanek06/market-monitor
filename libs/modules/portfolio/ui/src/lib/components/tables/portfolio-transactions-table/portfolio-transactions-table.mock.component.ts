import { Component, input } from '@angular/core';
import { PortfolioTransactionMore } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-transactions-table',
  standalone: true,
  template: ``,
})
export class PortfolioTransactionsTableComponentMock {
  showTransactionFees = input<boolean>();
  data = input<PortfolioTransactionMore[] | null | undefined>();
  showSymbolFilter = input<boolean>();
}
