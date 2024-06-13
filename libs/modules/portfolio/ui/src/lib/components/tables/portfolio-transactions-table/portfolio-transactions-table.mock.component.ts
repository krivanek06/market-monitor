import { Component, input, output } from '@angular/core';
import { PortfolioTransactionMore } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-transactions-table',
  standalone: true,
  template: ``,
})
export class PortfolioTransactionsTableComponentMock {
  deleteEmitter = output<PortfolioTransactionMore>();
  showTransactionFees = input<boolean>();
  data = input<PortfolioTransactionMore[] | null | undefined>();
  showSymbolFilter = input<boolean>();
  showActionButton = input(false);
  showUser = input(false);
}
