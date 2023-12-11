import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageTradingComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [PageTradingComponent],
  template: `<app-page-trading></app-page-trading>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingComponent {}
