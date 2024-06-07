import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ClickableDirective, DefaultImgDirective, PositionColoringDirective } from '../../../directives';

@Component({
  selector: 'app-rank-card',
  standalone: true,
  imports: [
    CommonModule,
    MatRippleModule,
    ClickableDirective,
    MatIconModule,
    PositionColoringDirective,
    DefaultImgDirective,
  ],
  template: `
    <div
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickableDirective.clickable()"
      [matRippleUnbounded]="false"
      [style.width.px]="cardWidthPx()"
      [style.height.px]="cardHeightPx()"
      class="group relative rounded-lg shadow-md"
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
          class="border-wt-gray-medium ml-2 mt-1 rounded-full border px-2 py-1 text-lg"
          appPositionColoring
          [position]="currentPositions()"
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
            <mat-icon *ngIf="positionChange > 0" color="accent">expand_less</mat-icon>
            <mat-icon *ngIf="positionChange < 0" color="warn">expand_more</mat-icon>
          </div>
        }
      </div>

      <!-- content -->
      <ng-content></ng-content>
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
  protected clickableDirective = inject(ClickableDirective);

  cardWidthPx = input<number | null>();
  cardHeightPx = input<number | null>();

  /**
   * Image of the card
   */
  image = input.required<string | null>();

  /**
   * Position of the card
   */
  currentPositions = input.required<number>();

  /**
   * Previous position of the card
   */
  positionChange = input<number | undefined | null>();
}
