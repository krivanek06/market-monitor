import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-trading-simulator-edit',
  standalone: true,
  imports: [],
  template: `<p>page-trading-simulator-edit works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorEditComponent {}
