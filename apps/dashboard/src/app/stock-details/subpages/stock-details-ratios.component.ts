import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PageStockDetailsRatiosComponent } from '@market-monitor/modules/page-builder';
@Component({
  selector: 'app-stock-details-ratios',
  standalone: true,
  imports: [CommonModule, PageStockDetailsRatiosComponent],
  template: ` <app-page-stock-details-ratios></app-page-stock-details-ratios>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsRatiosComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
