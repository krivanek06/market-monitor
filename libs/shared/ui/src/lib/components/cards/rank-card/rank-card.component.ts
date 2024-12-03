import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ColorScheme } from '@mm/shared/data-access';
import { ClickableDirective, DefaultImgDirective, PositionColoringDirective } from '../../../directives';

@Component({
  selector: 'app-rank-card',
  standalone: true,
  imports: [NgClass, MatRippleModule, MatIconModule, PositionColoringDirective, DefaultImgDirective],
  template: `
    <div
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickableDirective.clickable()"
      [matRippleUnbounded]="false"
      [style.width.px]="cardWidthPx()"
      [style.height.px]="cardHeightPx()"
      class="group relative rounded-lg border-2 shadow-md"
      appPositionColoring
      #color="coloring"
      [position]="currentPositions()"
      cssSelector="border-color"
    >
      <!-- background image -->
      <img
        appDefaultImg
        [src]="image()"
        class="h-full w-full object-cover opacity-30 transition-all duration-500 focus-within:opacity-95 group-hover:opacity-95"
        alt="card background image"
      />

      <!-- positions -->
      <div class="absolute top-0 flex w-full justify-between px-1">
        <!-- current position -->
        <div
          class="ml-2 mt-1 rounded-full border px-2 py-1 text-lg"
          [style.color]="color.usedColor()"
          [style.borderColor]="color.usedColor()"
        >
          #{{ currentPositions() }}
        </div>

        <!-- position change -->
        @if (positionChange(); as positionChange) {
          <div
            class="flex items-center text-base"
            [ngClass]="{
              'text-wt-success': positionChange > 0,
              'text-wt-danger': positionChange < 0,
            }"
          >
            <span>{{ positionChange }}</span>
            @if (positionChange > 0) {
              <mat-icon color="accent">expand_less</mat-icon>
            } @else if (positionChange < 0) {
              <mat-icon color="warn">expand_more</mat-icon>
            }
          </div>
        }
      </div>

      <!-- content -->
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  hostDirectives: [
    {
      directive: ClickableDirective,
      inputs: ['clickable'],
      outputs: ['itemClicked'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankCardComponent {
  protected readonly clickableDirective = inject(ClickableDirective);
  readonly ColorScheme = ColorScheme;

  readonly cardWidthPx = input<number | null>();
  readonly cardHeightPx = input<number | null>();

  /**
   * Image of the card
   */
  readonly image = input.required<string | null>();

  /**
   * Position of the card
   */
  readonly currentPositions = input.required<number>();

  /**
   * Previous position of the card
   */
  readonly positionChange = input<number | undefined | null>();
}
