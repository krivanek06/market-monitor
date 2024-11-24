import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TRADING_SIMULATOR_PARTICIPANTS_LIMIT, TradingSimulator, UserBaseMin } from '@mm/api-types';
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
    TruncatePipe,
    TradingSimulatorInfoOverviewButtonComponent,
    UpperCasePipe,
    NgClass,
  ],
  template: `
    <app-general-card [title]="tradingSimulator().name | truncate: 25">
      <!-- title right -->
      <ng-template appGeneralCardTitleRight>
        <div class="flex gap-2">
          <!-- owner buttons -->
          @if (tradingSimulator().state !== 'draft') {
            <button (click)="onStats()" mat-flat-button type="button">
              <mat-icon iconPositionEnd>chevron_right</mat-icon>
              statistics
            </button>
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
          <span>State</span>
          <span
            [ngClass]="{
              'text-wt-accent-2': tradingSimulator().state === 'draft',
              'text-wt-success': tradingSimulator().state === 'live' || tradingSimulator().state === 'started',
              'text-wt-danger': tradingSimulator().state === 'finished',
            }"
          >
            {{ tradingSimulator().state | uppercase }}
          </span>
        </div>

        <div class="g-item-wrapper">
          <span>End</span>
          <span>{{ tradingSimulator().endDateTime | date: 'HH:mm MMM d, y' }}</span>
        </div>

        <div class="g-item-wrapper">
          <span>Rounds</span>
          <div class="space-x-1">
            <span>{{ tradingSimulator().oneRoundDurationMinutes | dateReadable: 'minutes' }}</span>
            <span>/</span>
            <span>{{ tradingSimulator().maximumRounds }}</span>
          </div>
        </div>

        <div class="g-item-wrapper">
          <span>Total Time</span>
          <span>{{ tradingSimulator().totalTimeMinutes | dateReadable: 'minutes' }}</span>
        </div>

        <div class="g-item-wrapper border-wt-border border-b">
          <span>Participants</span>
          <span>{{ tradingSimulator().currentParticipants }} / {{ TRADING_SIMULATOR_PARTICIPANTS_LIMIT }}</span>
        </div>
      </div>

      <!-- action buttons -->
      <ng-template appGeneralCardActionContent>
        <div class="flex w-full justify-between gap-2 p-2">
          <!-- info -->
          <app-trading-simulator-info-overview-button
            class="w-[120px]"
            [tradingSimulator]="tradingSimulator()"
            [participantUsers]="participantUsers() ?? []"
          />

          <!-- owner buttons -->
          @if (tradingSimulator().owner.id === authUser().id) {
            @if (tradingSimulator().state === 'draft') {
              <!-- edit -->
              <button (click)="onEdit()" mat-flat-button type="button" class="w-[100px]">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
            }
            @if (tradingSimulator().state === 'live') {
              <!-- draft -->
              <button (click)="onDraft()" mat-stroked-button color="warn" type="button">Change to Draft</button>
            }
          } @else {
            @if (tradingSimulator().state === 'live') {
              @if (isUserJoined()) {
                <!-- visit -->
                <button (click)="onVisit()" mat-stroked-button type="button" color="primary" class="w-[100px]">
                  Visit
                </button>
              }
            }
          }
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
  readonly visitClicked = output<void>();
  readonly editClicked = output<void>();
  readonly statsClicked = output<void>();
  readonly draftClicked = output<void>();

  readonly tradingSimulator = input.required<TradingSimulator>();
  readonly participantUsers = input<UserBaseMin[]>();

  /** authenticated user */
  readonly authUser = input.required<UserBaseMin>();

  readonly isUserJoined = computed(() => this.tradingSimulator().participants.includes(this.authUser().id));

  readonly TRADING_SIMULATOR_PARTICIPANTS_LIMIT = TRADING_SIMULATOR_PARTICIPANTS_LIMIT;

  onVisit() {
    this.visitClicked.emit();
  }

  onEdit() {
    this.editClicked.emit();
  }

  onStats() {
    this.statsClicked.emit();
  }

  onDraft() {
    this.draftClicked.emit();
  }
}
