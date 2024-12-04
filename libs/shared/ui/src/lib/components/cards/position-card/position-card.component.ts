import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ColorScheme } from '@mm/shared/data-access';
import { ClickableDirective, PositionColoringDirective } from '../../../directives';

@Component({
  selector: 'app-position-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatRippleModule, MatIconModule, PositionColoringDirective],
  template: `
    <mat-card
      appearance="outlined"
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickableDirective.clickable()"
      [matRippleUnbounded]="false"
      class="px-6 pb-3 pt-8 shadow-md"
      appPositionColoring
      [position]="currentPositions()"
      [defaultPositionColor]="ColorScheme.GRAY_LIGHT_VAR"
      cssSelector="background-color"
    >
      <div class="relative">
        <!-- position -->
        <div
          class="bg-wt-gray-light-strong border-wt-gray-light-strong absolute -left-4 -top-6 z-10 flex h-10 items-center gap-4 rounded-full border opacity-90"
          [ngClass]="{
            'w-10': !showPreviousPosition(),
          }"
        >
          <div class="ml-2 text-lg" appPositionColoring [position]="currentPositions()">#{{ currentPositions() }}</div>
          <div
            *ngIf="showPreviousPosition()"
            class="flex items-center"
            [ngClass]="{
              'text-wt-success': isPositionIncreased(),
              'text-wt-danger': !isPositionIncreased(),
            }"
          >
            <span *ngIf="previousPosition() as previousPosition">{{ previousPosition - currentPositions() }}</span>
            <mat-icon *ngIf="isPositionIncreased()" color="accent">expand_less</mat-icon>
            <mat-icon *ngIf="!isPositionIncreased()" color="warn">expand_more</mat-icon>
          </div>
        </div>

        <!-- content -->
        <ng-content> </ng-content>
      </div>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }

    mat-card-content {
      height: inherit;
    }
  `,
  hostDirectives: [
    {
      directive: ClickableDirective,
      inputs: ['clickable'],
      outputs: ['itemClicked'],
    },
  ],
})
export class PositionCardComponent {
  protected clickableDirective = inject(ClickableDirective);
  currentPositions = input.required<number>();
  previousPosition = input<number | null | undefined>();

  ColorScheme = ColorScheme;

  showPreviousPosition = computed(() => this.previousPosition() && this.currentPositions() !== this.previousPosition());
  isPositionIncreased = computed(() => {
    const previousPosition = this.previousPosition();
    return previousPosition && previousPosition - this.currentPositions() > 0;
  });
}
