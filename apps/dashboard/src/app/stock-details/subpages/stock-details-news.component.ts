import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PageStockDetailsNewsComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-stock-details-news',
  standalone: true,
  imports: [CommonModule, PageStockDetailsNewsComponent],
  template: `<app-page-stock-details-news></app-page-stock-details-news>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsNewsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
