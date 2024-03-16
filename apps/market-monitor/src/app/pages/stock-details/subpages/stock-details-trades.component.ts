import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageStockDetailsTradesComponent } from '@mm/page-builder';
@Component({
  selector: 'app-stock-details-trades',
  standalone: true,
  imports: [CommonModule, PageStockDetailsTradesComponent],
  template: `<app-page-stock-details-trades></app-page-stock-details-trades>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsTradesComponent {}
