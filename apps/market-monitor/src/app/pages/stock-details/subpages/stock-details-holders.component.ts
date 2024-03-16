import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageStockDetailsHoldersComponent } from '@mm/page-builder';
@Component({
  selector: 'app-stock-details-holders',
  standalone: true,
  imports: [CommonModule, PageStockDetailsHoldersComponent],
  template: `<app-page-stock-details-holders></app-page-stock-details-holders>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsHoldersComponent {}
