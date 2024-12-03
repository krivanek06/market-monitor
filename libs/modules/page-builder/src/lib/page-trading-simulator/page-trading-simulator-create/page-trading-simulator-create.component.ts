import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TradingSimulatorFormComponent } from '@mm/trading-simulator/features';

@Component({
  selector: 'app-page-trading-simulator-create',
  standalone: true,
  imports: [TradingSimulatorFormComponent],
  template: `<app-trading-simulator-form />`,
  styles: `
    :host {
      display: block;
      max-width: 1320px;
      margin: 0 auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorCreateComponent {}
