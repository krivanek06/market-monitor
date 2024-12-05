import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TRADING_SIMULATOR_PARTICIPANTS_LIMIT, TradingSimulator, UserBaseMin } from '@mm/api-types';
import {
  DateReadablePipe,
  DefaultImgDirective,
  GeneralCardActionContentDirective,
  GeneralCardComponent,
  TruncatePipe,
} from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-display-card',
  standalone: true,
  imports: [
    GeneralCardComponent,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    DateReadablePipe,
    TruncatePipe,
    NgClass,
    GeneralCardActionContentDirective,
    MatCardModule,
    DefaultImgDirective,
  ],
  template: `
    <app-general-card>
      <!-- header -->
      <mat-card-title class="flex items-center gap-2 text-base">
        <div class="flex w-full justify-between">
          <div class="flex items-center gap-2">
            <div
              class="h-3 w-3 rounded-full"
              [ngClass]="{
                'bg-wt-accent-2': tradingSimulator().state === 'draft',
                'bg-wt-success': tradingSimulator().state === 'live' || tradingSimulator().state === 'started',
                'bg-wt-danger': tradingSimulator().state === 'finished',
              }"
            ></div>
            <h2 class="text-wt-primary mb-0">
              {{ tradingSimulator().name | truncate: 25 }}
            </h2>
          </div>
          <div class="flex items-center">
            @if (tradingSimulator().invitationCode) {
              <mat-icon color="warn" class="scale-75">lock</mat-icon>
              <div class="text-wt-danger text-sm">Private</div>
            } @else {
              <mat-icon color="accent" class="scale-75">lock_open</mat-icon>
              <div class="text-wt-success text-sm">Public</div>
            }
          </div>
        </div>
      </mat-card-title>

      <!-- content -->
      <div class="@container">
        <div class="@sm:grid-cols-2 grid">
          <div class="g-item-wrapper">
            <span>Start</span>
            <span>{{ tradingSimulator().startDateTime | date: 'HH:mm MMM d, y' }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Round</span>
            <span
              >{{ tradingSimulator().currentRound }} /
              {{ tradingSimulator().maximumRounds }}
              [{{ tradingSimulator().oneRoundDurationMinutes | dateReadable: 'minutes' }}]
            </span>
          </div>

          <div class="g-item-wrapper">
            <span>End</span>
            <span>{{ tradingSimulator().endDateTime | date: 'HH:mm MMM d, y' }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Participants</span>
            <span>{{ tradingSimulator().currentParticipants }} / {{ TRADING_SIMULATOR_PARTICIPANTS_LIMIT }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Total Time</span>
            <span>{{ tradingSimulator().totalTimeMinutes | dateReadable: 'minutes' }}</span>
          </div>

          <div class="g-item-wrapper border-wt-border border-b">
            <div class="flex items-center gap-2">
              <img appDefaultImg [src]="tradingSimulator().owner.personal.photoURL" class="h-5 w-5 rounded-lg" />
              <span>{{ tradingSimulator().owner.personal.displayName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- action buttons -->
      <ng-template appGeneralCardActionContent>
        <div class="flex w-full justify-end gap-2">
          <!-- owner buttons -->
          @if (tradingSimulator().owner.id === authUser().id) {
            @if (tradingSimulator().state === 'draft') {
              <!-- edit -->
              <button (click)="onEdit()" mat-stroked-button color="primary" type="button" class="w-[100px]">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
            }
          }

          <!-- owner buttons -->
          @if (tradingSimulator().state !== 'draft') {
            <button (click)="onStats()" mat-stroked-button color="primary" type="button">
              <mat-icon iconPositionEnd>chevron_right</mat-icon>
              statistics
            </button>
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
  readonly editClicked = output<void>();
  readonly statsClicked = output<void>();

  readonly tradingSimulator = input.required<TradingSimulator>();

  /** authenticated user */
  readonly authUser = input.required<UserBaseMin>();

  readonly isUserJoined = computed(() => this.tradingSimulator().participants.includes(this.authUser().id));

  readonly TRADING_SIMULATOR_PARTICIPANTS_LIMIT = TRADING_SIMULATOR_PARTICIPANTS_LIMIT;

  onEdit() {
    this.editClicked.emit();
  }

  onStats() {
    this.statsClicked.emit();
  }
}
