import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketOverviewComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-economics',
  standalone: true,
  imports: [CommonModule, PageMarketOverviewComponent],
  template: `<app-page-market-overview></app-page-market-overview>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketEconomicsComponent {}
