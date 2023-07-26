import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageStockScreenerComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-stock-screener',
  standalone: true,
  imports: [CommonModule, PageStockScreenerComponent],
  templateUrl: './stock-screener.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockScreenerComponent {}
