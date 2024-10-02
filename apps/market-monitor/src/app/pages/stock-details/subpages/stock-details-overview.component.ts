import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageStockDetailsOverviewComponent } from '@mm/page-builder';

@Component({
  selector: 'app-details-overview',
  standalone: true,
  imports: [PageStockDetailsOverviewComponent],
  template: `<app-page-details-overview />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsOverviewComponent {}
