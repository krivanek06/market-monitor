import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-trading-simulator',
  standalone: true,
  imports: [],
  template: `<p>page-trading-simulator works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorComponent {}
