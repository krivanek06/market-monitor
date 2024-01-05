import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PageStockDetailsNewsComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-stock-details-news',
  standalone: true,
  imports: [CommonModule, PageStockDetailsNewsComponent],
  template: `<app-page-stock-details-news></app-page-stock-details-news>`,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsNewsComponent implements OnInit {
  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {
    this.metaTagService.addTags([
      {
        name: 'keywords',
        content: 'Company News',
      },
      {
        name: 'description',
        content: 'Latest news about publicly traded companies.',
      },
    ]);
  }
}
