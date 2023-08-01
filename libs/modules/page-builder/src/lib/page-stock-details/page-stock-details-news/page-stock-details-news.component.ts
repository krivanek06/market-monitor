import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NewsSearchComponent } from '@market-monitor/modules/market-general';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-news',
  standalone: true,
  imports: [CommonModule, NewsSearchComponent],
  templateUrl: './page-stock-details-news.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsNewsComponent extends PageStockDetailsBase {
  constructor() {
    super();
    console.log(this.route.parent?.snapshot.params?.['symbol']);
    console.log();
  }
}
