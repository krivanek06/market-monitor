import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketStockScreenerComponent } from '@mm/page-builder';

@Component({
  selector: 'app-market-stock-screener',
  standalone: true,
  imports: [CommonModule, PageMarketStockScreenerComponent],
  template: `<app-page-market-stock-screener></app-page-market-stock-screener>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketCalendarComponent {}
