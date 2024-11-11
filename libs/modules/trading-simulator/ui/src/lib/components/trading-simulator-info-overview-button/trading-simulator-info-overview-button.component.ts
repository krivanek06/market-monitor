import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TradingSimulator, TradingSimulatorParticipatingUsers } from '@mm/api-types';
import { DateReadablePipe, DefaultImgDirective, InfoButtonComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-info-overview-button',
  standalone: true,
  imports: [InfoButtonComponent, DatePipe, DateReadablePipe, CurrencyPipe, DefaultImgDirective, UpperCasePipe],
  template: `
    <app-info-button infoDisplay="dialog" [useCustomContent]="true">
      <!-- basic info -->
      <div class="text-wt-primary mb-2">Basic Info</div>
      <div class="mb-4 grid grid-cols-2">
        <div class="g-item-wrapper">
          <span>Start</span>
          <span>{{ tradingSimulator().startDateTime | date: 'HH:mm MMM d, y' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>State</span>
          <span>{{ tradingSimulator().state | uppercase }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>End</span>
          <span>{{ tradingSimulator().endDateTime | date: 'HH:mm MMM d, y' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Rounds</span>
          <div class="space-x-1">
            <span>{{ tradingSimulator().oneRoundDurationSeconds | dateReadable: 'seconds' }}</span>
            <span>/</span>
            <span>{{ tradingSimulator().maximumRounds }}</span>
          </div>
        </div>

        <div class="g-item-wrapper">
          <span>Total Time</span>
          <span>{{ tradingSimulator().totalTimeSeconds | dateReadable: 'seconds' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Participants</span>
          <span>{{ tradingSimulator().currentParticipants }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Starting Cash</span>
          <span>{{ tradingSimulator().cashStartingValue | currency }}</span>
        </div>

        <div class="g-item-wrapper border-wt-border border-b">
          <span>Owner</span>
          <div class="flex items-center gap-x-3">
            <img appDefaultImg [src]="tradingSimulator().owner.personal.photoURL" class="h-7 w-7 rounded-full" />
            <span>{{ tradingSimulator().owner.personal.displayName }}</span>
          </div>
        </div>
      </div>

      <!-- Margin -->
      <div class="text-wt-primary mb-2">Margin Trading</div>
      <div class="mb-4 grid grid-cols-3 gap-x-4">
        @if (tradingSimulator().marginTrading) {
          <div class="g-item-wrapper">
            <span>Subtract Period</span>
            <span>{{ tradingSimulator().marginTrading?.subtractPeriodRounds }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Interest Rate</span>
            <span>{{ tradingSimulator().marginTrading?.subtractInterestRate }}%</span>
          </div>

          <div class="g-item-wrapper border-wt-border border-b">
            <span>Conversion Rage</span>
            <span>{{ tradingSimulator().marginTrading?.marginConversionRate }}:1</span>
          </div>
        } @else {
          <div class="border-wt-border col-span-3 border-b p-2 text-center">No margin trading</div>
        }
      </div>

      <!-- Cash Issued -->
      <div class="text-wt-primary mb-2">Cash Issued</div>
      <div class="mb-4 grid grid-cols-2">
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

      <!-- participants -->
      <div class="text-wt-primary mb-2">Participants</div>
      <div class="mb-4 grid grid-cols-3 gap-3">
        @for (user of participantUsers(); track user.id) {
          <div class="border-wt-primary flex items-center gap-2 rounded-full">
            <img appDefaultImg [src]="user.personal.photoURL" class="h-7 w-7 rounded-full" />
            <span>{{ user.personal.displayName }}</span>
          </div>
        } @empty {
          <div class="border-wt-border col-span-3 border-b p-2 pb-4 text-center">No participants</div>
        }
      </div>
    </app-info-button>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorInfoOverviewButtonComponent {
  readonly tradingSimulator = input.required<TradingSimulator>();
  readonly participantUsers = input<TradingSimulatorParticipatingUsers['data']>([]);
}
