import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NewsSearchComponent } from '@market-monitor/modules/market-general/features';

@Component({
  selector: 'app-market-news',
  standalone: true,
  imports: [CommonModule, NewsSearchComponent],
  template: `<app-news-search [searchData]="{ newsType: 'general' }"></app-news-search> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketNewsComponent {}
