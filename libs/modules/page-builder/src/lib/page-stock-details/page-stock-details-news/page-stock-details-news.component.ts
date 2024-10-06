import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NewsSearchComponent } from '@mm/market-general/features';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-news',
  standalone: true,
  imports: [NewsSearchComponent],
  template: `<app-news-search [searchData]="{ newsType: 'stocks', symbol: stockSymbolSignal() }" />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsNewsComponent extends PageStockDetailsBase {}
