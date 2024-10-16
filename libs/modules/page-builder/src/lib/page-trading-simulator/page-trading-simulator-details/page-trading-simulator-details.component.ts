import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-trading-simulator-details',
  standalone: true,
  imports: [],
  template: `<p>page-trading-simulator-details works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsComponent {}
