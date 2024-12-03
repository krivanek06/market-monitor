import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { TRADING_SIMULATOR_PARTICIPANTS_LIMIT, TradingSimulator } from '@mm/api-types';
import { ClickableDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-display-item',
  standalone: true,
  imports: [MatRippleModule, DatePipe, CurrencyPipe],
  template: `
    <div
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickableDirective.clickable()"
      [matRippleUnbounded]="false"
      class="border-wt-gray-medium rounded-lg border p-2"
    >
      <div class="flex justify-between">
        <!-- left -->
        <div>
          <div class="text-wt-gray-dark">{{ tradingSimulator().name }}</div>
          <div>{{ tradingSimulator().startDateTime | date: 'HH:mm MMM d, y' }}</div>
        </div>

        <!-- right -->
        <div>
          <div class="text-wt-gray-dark">
            [{{ tradingSimulator().currentParticipants }} / {{ TRADING_SIMULATOR_PARTICIPANTS_LIMIT }}]
          </div>
          <div>{{ tradingSimulator().cashStartingValue | currency }}</div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: ClickableDirective,
      inputs: ['clickable'],
      outputs: ['itemClicked'],
    },
  ],
})
export class TradingSimulatorDisplayItemComponent {
  readonly clickableDirective = inject(ClickableDirective);
  readonly tradingSimulator = input.required<TradingSimulator>();

  readonly TRADING_SIMULATOR_PARTICIPANTS_LIMIT = TRADING_SIMULATOR_PARTICIPANTS_LIMIT;
}
