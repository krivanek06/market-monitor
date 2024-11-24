import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TradingSimulator } from '@mm/api-types';
import { DateReadablePipe, GeneralCardComponent, SectionTitleComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-page-trading-simulator-statistics-info',
  standalone: true,
  imports: [GeneralCardComponent, DateReadablePipe, SectionTitleComponent],
  template: `
    <app-section-title title="Simulator Information" titleSize="lg" />

    <div class="grid grid-cols-3">
      <!-- basic information -->
      <app-general-card class="mb-4">
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
