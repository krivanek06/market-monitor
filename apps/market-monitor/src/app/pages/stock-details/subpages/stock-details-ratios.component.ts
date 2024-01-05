import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PageStockDetailsRatiosComponent } from '@market-monitor/modules/page-builder';
@Component({
  selector: 'app-stock-details-ratios',
  standalone: true,
  imports: [CommonModule, PageStockDetailsRatiosComponent],
  template: ` <app-page-stock-details-ratios></app-page-stock-details-ratios>`,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsRatiosComponent implements OnInit {
  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {
    this.metaTagService.addTags([
      {
        name: 'keywords',
        content: 'Financial Ratios',
      },
      {
        name: 'description',
        content: 'Financial ratios about publicly traded companies.',
      },
    ]);
  }
}
