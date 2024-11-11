import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TradingSimulator, TradingSimulatorParticipatingUsers, UserBaseMin } from '@mm/api-types';
import {
  DateReadablePipe,
  GeneralCardActionContentDirective,
  GeneralCardComponent,
  GeneralCardTitleRightDirective,
  TruncatePipe,
} from '@mm/shared/ui';
import { TradingSimulatorInfoOverviewButtonComponent } from '../trading-simulator-info-overview-button/trading-simulator-info-overview-button.component';

@Component({
  selector: 'app-trading-simulator-display-card',
  standalone: true,
  imports: [
    GeneralCardComponent,
    MatButtonModule,
    MatIconModule,
    GeneralCardActionContentDirective,
    GeneralCardTitleRightDirective,
    DatePipe,
    DateReadablePipe,
    NgClass,
    TruncatePipe,
    TradingSimulatorInfoOverviewButtonComponent,
  ],
  template: `
    <app-general-card [title]="tradingSimulator().name | truncate: 25">
      <!-- title right -->
      <ng-template appGeneralCardTitleRight>
        <div>
          @if (isUserJoined()) {
            <button mat-stroked-button type="button" color="warn" class="w-[100px]">Leave</button>
          } @else {
            <button mat-stroked-button type="button" color="accent" class="w-[100px]">Join</button>
          }
        </div>
      </ng-template>

      <!-- content -->
      <div class="grid grid-cols-2">
        <div class="g-item-wrapper">
          <span>Start</span>
          <span>{{ tradingSimulator().startDateTime | date: 'HH:mm MMM d, y' }}</span>
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
          <span>End</span>
          <span>{{ tradingSimulator().endDateTime | date: 'HH:mm MMM d, y' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>State</span>
          <span>{{ tradingSimulator().state }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Total Time</span>
          <span>{{ tradingSimulator().totalTimeSeconds | dateReadable: 'seconds' }}</span>
        </div>

        <div class="g-item-wrapper border-wt-border border-b">
          <span>Participants</span>
          <span>{{ tradingSimulator().currentParticipants }}</span>
        </div>
      </div>

      <!-- action buttons -->
      <ng-template appGeneralCardActionContent>
        <div class="flex w-full justify-between gap-4">
          <app-trading-simulator-info-overview-button
            class="w-[120px]"
            [tradingSimulator]="tradingSimulator()"
            [participantUsers]="participantUsers()?.data ?? []"
          />
          <button mat-stroked-button type="button" color="primary" class="w-[100px]">Visit</button>
        </div>
      </ng-template>
    </app-general-card>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorDisplayCardComponent {
  readonly tradingSimulator = input.required<TradingSimulator>();
  readonly participantUsers = input<TradingSimulatorParticipatingUsers>();

  /** authenticated user */
  readonly authUser = input.required<UserBaseMin>();

  readonly isUserJoined = computed(() => this.tradingSimulator().participants.includes(this.authUser().id));
}
