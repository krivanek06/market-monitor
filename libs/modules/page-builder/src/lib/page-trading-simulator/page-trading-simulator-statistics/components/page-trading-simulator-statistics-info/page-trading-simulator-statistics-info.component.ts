import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TradingSimulator } from '@mm/api-types';
import { DateReadablePipe, GeneralCardComponent, SectionTitleComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-page-trading-simulator-statistics-info',
  standalone: true,
  imports: [GeneralCardComponent, DateReadablePipe, SectionTitleComponent, DatePipe, CurrencyPipe],
  template: `
    <app-section-title title="Simulator Information" titleSize="lg" />

    <div class="grid grid-cols-3 gap-x-4">
      <!-- info 1 -->
      <app-general-card>
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
      </app-general-card>

      <!-- info 1 -->
      <app-general-card>
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
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorStatisticsInfoComponent {
  readonly tradingSimulator = input.required<TradingSimulator>();

  // todo - every one second calculated round remaining time
}
