import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-trading-simulator-create',
  standalone: true,
  imports: [],
  template: `<p>page-trading-simulator-create works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorCreateComponent {}
