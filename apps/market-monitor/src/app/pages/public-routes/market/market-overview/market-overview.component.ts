import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageMarketOverviewComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [CommonModule, PageMarketOverviewComponent],
  templateUrl: './market-overview.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketOverviewComponent {}
