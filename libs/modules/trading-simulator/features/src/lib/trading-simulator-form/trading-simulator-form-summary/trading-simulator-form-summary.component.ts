import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-trading-simulator-form-summary',
  standalone: true,
  imports: [],
  template: `<p>trading-simulator-form-summary works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorFormSummaryComponent {
  // todo - implement it
}
