import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PageStockDetailsFinancialsComponent } from '@market-monitor/modules/page-builder';
@Component({
  selector: 'app-stock-details-financials',
  standalone: true,
  imports: [CommonModule, PageStockDetailsFinancialsComponent],
  template: `<app-page-stock-details-financials></app-page-stock-details-financials>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsFinancialsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
