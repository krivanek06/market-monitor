import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TradingSimulatorAggregationParticipantsData } from '@mm/api-types';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  PositionColoringDirective,
} from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-participant-item',
  standalone: true,
  imports: [
    DefaultImgDirective,
    PositionColoringDirective,
    PercentageIncreaseDirective,
    LargeNumberFormatterPipe,
    NgClass,
    MatIconModule,
  ],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- position -->
        <div
          appPositionColoring
          #color="coloring"
          class="w-8 rounded-full border-2 p-1 text-center text-sm shadow-md"
          cssSelector="border-color"
          [position]="position()"
        >
          <span [style.color]="color.usedColor()">{{ position() }}</span>
        </div>

        <!-- image -->
        <img appDefaultImg [src]="participant().userData.personal.photoURL" class="h-6 w-6 rounded-full" />

        <!-- name -->
        <span class="text-wt-primary">{{ participant().userData.personal.displayNameInitials }}</span>

        @if (participant().rank.rankChange; as rankChange) {
          <div>|</div>
          <div class="flex items-center gap-1">
            <span [ngClass]="{ 'text-wt-success': rankChange > 0, 'text-wt-danger': rankChange < 0 }">
              {{ participant().rank.rankChange }}
            </span>
            @if (rankChange > 0) {
              <mat-icon color="accent" class="scale-150">arrow_drop_up</mat-icon>
            } @else if (rankChange < 0) {
              <mat-icon color="warn" class="scale-150">arrow_drop_down</mat-icon>
            }
          </div>
        }
      </div>

      <!-- percentage increase -->
      <div class="flex items-center gap-2">
        <div [style.color]="color.usedColor()">
          {{ participant().portfolioState.balance | largeNumberFormatter: false : true }}
        </div>
        <div
          appPercentageIncrease
          [currentValues]="{
            value: participant().portfolioState.balance,
            valueToCompare: participant().portfolioState.startingCash,
            hideValue: true,
          }"
        ></div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorParticipantItemComponent {
  readonly participant = input.required<TradingSimulatorAggregationParticipantsData>();
  readonly position = input.required<number>();
}
