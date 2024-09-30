import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketOverviewComponent } from '@mm/page-builder';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [PageMarketOverviewComponent],
  template: `<app-page-market-overview />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketOverviewComponent {}
