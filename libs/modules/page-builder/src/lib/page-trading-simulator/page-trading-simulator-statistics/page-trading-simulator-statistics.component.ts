import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-trading-simulator-statistics',
  standalone: true,
  imports: [],
  template: `<p>trading-simulator-statistics works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorStatisticsComponent {}
