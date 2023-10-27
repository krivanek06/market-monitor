import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PageStockDetailsTradesComponent } from '@market-monitor/modules/page-builder';
@Component({
  selector: 'app-stock-details-trades',
  standalone: true,
  imports: [CommonModule, PageStockDetailsTradesComponent],
  template: `<app-page-stock-details-trades></app-page-stock-details-trades>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsTradesComponent implements OnInit {
  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {}
}
