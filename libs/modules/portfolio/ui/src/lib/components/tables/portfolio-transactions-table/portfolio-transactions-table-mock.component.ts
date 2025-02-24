import { Component, input, output } from '@angular/core';
import { PortfolioTransactionMore } from '@mm/api-types';

@Component({
  selector: 'app-portfolio-transactions-table',
  standalone: true,
  template: ``,
})
export class PortfolioTransactionsTableComponentMock {
  deleteEmitter = output<PortfolioTransactionMore>();
  showTransactionFees = input<boolean>(false);
  data = input<PortfolioTransactionMore[] | null | undefined>();
  showSymbolFilter = input<boolean>(false);
  showActionButton = input(false);
  showUser = input(false);
}
