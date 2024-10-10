import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MarketOverviewComponent } from './market-subpages/market-overview.component';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [MarketOverviewComponent],
  template: ` <app-market-overview /> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketComponent {}
