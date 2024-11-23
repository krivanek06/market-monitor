import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-trading-simulator-participant-card',
  standalone: true,
  imports: [],
  template: `<p>trading-simulator-participant-card works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorParticipantCardComponent {}
