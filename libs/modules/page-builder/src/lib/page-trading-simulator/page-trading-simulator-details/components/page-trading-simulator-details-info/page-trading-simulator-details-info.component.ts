import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TradingSimulator } from '@mm/api-types';
import { DateReadablePipe, GeneralCardComponent, InfoButtonComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-page-trading-simulator-details-info',
  standalone: true,
  imports: [
    GeneralCardComponent,
    DateReadablePipe,
    DatePipe,
    CurrencyPipe,
    NgTemplateOutlet,
    MatButtonModule,
    InfoButtonComponent,
  ],
  template: `
    <!-- large screen -->
    <div class="hidden xl:block">
      <ng-container [ngTemplateOutlet]="infoTmpl" />
    </div>

    <!-- small screen -->
    <div class="xl:hidden">
      <app-info-button [useCustomContent]="true">
        <ng-container [ngTemplateOutlet]="infoTmpl" />
      </app-info-button>
    </div>

    <ng-template #infoTmpl>
      <div class="grid gap-3">
        <!-- admin info -->
        @if (isAuthUserOwner()) {
          <app-general-card title="Admin Information">
            <div class="g-item-wrapper">
              <div>Code</div>
              <div>{{ tradingSimulator().invitationCode }}</div>
            </div>
          </app-general-card>
        }

        <!-- info 1 -->
        <app-general-card title="Simulator Information">
          <div class="g-item-wrapper">
            <div>Current Round</div>
            <div>{{ tradingSimulator().currentRound }} / {{ tradingSimulator().maximumRounds }}</div>
          </div>

          <div class="g-item-wrapper">
            <div>Remaining</div>
            <div>{{ (remainingTimeSeconds() | dateReadable: 'seconds') || 0 }}</div>
          </div>

          <div class="g-item-wrapper">
            <div>Next Round</div>
            <div>{{ tradingSimulator().nextRoundTime | date: 'HH:mm MMM d, y' }}</div>
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
            <div>Start</div>
            <div>{{ tradingSimulator().startDateTime | date: 'HH:mm MMM d, y' }}</div>
          </div>

          <div class="g-item-wrapper">
            <div>End</div>
            <div>{{ tradingSimulator().endDateTime | date: 'HH:mm MMM d, y' }}</div>
          </div>

          <div class="g-item-wrapper">
            <div>Total Time</div>
            <div>{{ tradingSimulator().totalTimeMinutes | dateReadable: 'minutes' }}</div>
          </div>

          <div class="g-item-wrapper">
            <div>Starting Cash</div>
            <div>{{ tradingSimulator().cashStartingValue | currency }}</div>
          </div>
        </app-general-card>

        <!-- additional cash -->
        <app-general-card title="Cash Issues">
          <div class="grid grid-cols-2">
            @for (item of tradingSimulator().cashAdditionalIssued; track $index) {
              <div class="g-item-wrapper">
                <div>Round</div>
                <div>{{ item.issuedOnRound }}</div>
              </div>

              <div class="g-item-wrapper border-wt-border border-b">
                <div>Cash</div>
                <div>{{ item.value | currency }}</div>
              </div>
            } @empty {
              <div class="border-wt-border col-span-2 border-b p-2 pb-4 text-center">No cash issued</div>
            }
          </div>
        </app-general-card>
      </div>
    </ng-template>
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
  readonly isAuthUserOwner = input<boolean>(false);
  readonly remainingTimeSeconds = input<number>(0);
}
