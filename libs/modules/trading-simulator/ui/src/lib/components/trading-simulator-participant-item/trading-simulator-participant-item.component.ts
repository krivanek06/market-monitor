import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TradingSimulatorParticipant } from '@mm/api-types';
import {
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
  PositionColoringDirective,
} from '@mm/shared/ui';

@Component({
  selector: 'app-trading-simulator-participant-item',
  standalone: true,
  imports: [DefaultImgDirective, PositionColoringDirective, PercentageIncreaseDirective, LargeNumberFormatterPipe],
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
  readonly participant = input.required<TradingSimulatorParticipant>();
  readonly position = input.required<number>();
}
