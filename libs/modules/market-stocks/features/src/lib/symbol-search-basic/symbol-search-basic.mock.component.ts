import { Component, input, output } from '@angular/core';
import { SymbolQuote } from '@mm/api-types';

@Component({
  selector: 'app-symbol-search-basic',
  standalone: true,
  template: ``,
})
export class SymbolSearchBasicComponentMock {
  clickedQuote = output<SymbolQuote>();
  openModalOnClick = input(true);
  holdings = input<SymbolQuote[]>([]);
  isSmallInput = input(false);
}
