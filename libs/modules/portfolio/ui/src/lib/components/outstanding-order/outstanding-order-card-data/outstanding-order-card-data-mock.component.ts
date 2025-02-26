import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IsStockMarketOpenExtend, OutstandingOrder } from '@mm/api-types';

@Component({
  selector: 'app-outstanding-order-card-data',
  standalone: true,
  imports: [],
  template: ``,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutstandingOrderCardDataMockComponent {
  readonly deleteClicked = output<void>();
  readonly order = input.required<OutstandingOrder>();
  readonly marketOpen = input<IsStockMarketOpenExtend>();
}
