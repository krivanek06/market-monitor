import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PageStockScreenerComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-stock-screener',
  standalone: true,
  imports: [CommonModule, PageStockScreenerComponent],
  template: `<app-page-stock-screener></app-page-stock-screener>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockScreenerComponent implements OnInit {
  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {
    this.metaTagService.addTags([
      {
        name: 'keywords',
        content: 'Stock Screener',
      },
      {
        name: 'description',
        content: 'Screen publicly traded companies.',
      },
    ]);
  }
}
