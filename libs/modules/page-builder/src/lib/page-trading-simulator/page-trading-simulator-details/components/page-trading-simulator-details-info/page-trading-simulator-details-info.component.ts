import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TradingSimulator } from '@mm/api-types';
import { DateReadablePipe, GeneralCardComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-page-trading-simulator-details-info',
  standalone: true,
  imports: [GeneralCardComponent, DateReadablePipe, DatePipe, CurrencyPipe],
  template: `
    <div class="grid gap-3">
      <!-- info 1 -->
      <app-general-card title="Simulator Information">
        <div class="g-item-wrapper">
          <div>Current Round</div>
          <div>{{ tradingSimulator().currentRound }} / {{ tradingSimulator().maximumRounds }}</div>
        </div>

        <div class="g-item-wrapper">
          <div>Round Remaining</div>
          <div>4min 22 sec.</div>
        </div>

        <div class="g-item-wrapper">
          <div>Round Duration</div>
          <div>{{ tradingSimulator().oneRoundDurationMinutes | dateReadable: 'minutes' }}</div>
        </div>

        <div class="g-item-wrapper">
          <div>Total Participants</div>
          <div>{{ tradingSimulator().currentParticipants }}</div>
        </div>

        <div class="g-item-wrapper">
          <span>Start</span>
          <span>{{ tradingSimulator().startDateTime | date: 'HH:mm MMM d, y' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>End</span>
          <span>{{ tradingSimulator().endDateTime | date: 'HH:mm MMM d, y' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Total Time</span>
          <span>{{ tradingSimulator().totalTimeMinutes | dateReadable: 'minutes' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Starting Cash</span>
          <span>{{ tradingSimulator().cashStartingValue | currency }}</span>
        </div>
      </app-general-card>

      <!-- additional cash -->
      <app-general-card title="Cash Issues">
        <div class="grid grid-cols-2">
          @for (item of tradingSimulator().cashAdditionalIssued; track $index) {
            <div class="g-item-wrapper">
              <span>Round</span>
              <span>{{ item.issuedOnRound }}</span>
            </div>

            <div class="g-item-wrapper border-wt-border border-b">
              <span>Cash</span>
              <span>{{ item.value | currency }}</span>
            </div>
          } @empty {
            <div class="border-wt-border col-span-2 border-b p-2 pb-4 text-center">No cash issued</div>
          }
        </div>
      </app-general-card>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsInfoComponent {
  readonly tradingSimulator = input.required<TradingSimulator>();

  // todo - every one second calculated round remaining time
}
