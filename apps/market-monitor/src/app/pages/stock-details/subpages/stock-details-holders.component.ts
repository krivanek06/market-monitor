import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PageStockDetailsHoldersComponent } from '@market-monitor/modules/page-builder';
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
export class StockDetailsHoldersComponent {
  constructor(private metaTagService: Meta) {}

  ngOnInit(): void {
    this.metaTagService.addTags([
      {
        name: 'keywords',
        content: 'Company Holders',
      },
      {
        name: 'description',
        content: 'Information about holders of publicly traded companies.',
      },
    ]);
  }
}
