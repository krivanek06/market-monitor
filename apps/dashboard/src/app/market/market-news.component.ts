import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NewsSearchComponent } from '@mm/market-general/features';

@Component({
  selector: 'app-market-news',
  standalone: true,
  imports: [NewsSearchComponent],
  template: `<app-news-search [searchData]="{ newsType: 'general' }" /> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketNewsComponent {}
