import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageStockScreenerComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-calendar',
  standalone: true,
  imports: [CommonModule, PageStockScreenerComponent],
  template: `<app-page-stock-screener></app-page-stock-screener>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketCalendarComponent {}
