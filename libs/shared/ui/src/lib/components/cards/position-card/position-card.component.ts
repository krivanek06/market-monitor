import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { PositionColoringDirective } from '../../../directives';

@Component({
  selector: 'app-position-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatRippleModule, MatIconModule, PositionColoringDirective],
  styles: `
      :host {
        display: block;
      }

      mat-card-content {
        height: inherit;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card
      appearance="outlined"
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickable()"
      [matRippleUnbounded]="false"
      class="shadow-md pt-8 pb-3 px-6"
      appPositionColoring
      [position]="currentPositions()"
      [defaultPositionColor]="ColorScheme.GRAY_LIGHT_VAR"
      positionType="background-color"
      (click)="onClick()"
      [ngClass]="{
        'g-clickable()-hover': clickable()
      }"
    >
      <div class="relative">
        <!-- position -->
        <div
          class="absolute -top-6 -left-4 h-10 z-10 rounded-full bg-slate-200 flex items-center gap-4 opacity-90 border border-wt-gray-light-strong"
          [ngClass]="{
            'w-10': !showPreviousPosition()
          }"
        >
          <div class="c-position text-lg ml-2" appPositionColoring [position]="currentPositions()">
            #{{ currentPositions() }}
          </div>
          <div
            *ngIf="showPreviousPosition()"
            class="flex items-center"
            [ngClass]="{
              'text-wt-success': isPositionIncreased(),
              'text-wt-danger': !isPositionIncreased()
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
})
export class PositionCardComponent {
  @Output() clickedEmitter = new EventEmitter<void>();

  currentPositions = input.required<number>();
  previousPosition = input<number | null | undefined>();
  clickable = input(false);

  ColorScheme = ColorScheme;

  showPreviousPosition = computed(() => this.previousPosition() && this.currentPositions() !== this.previousPosition());
  isPositionIncreased = computed(() => {
    const previousPosition = this.previousPosition();
    return previousPosition && previousPosition - this.currentPositions() > 0;
  });

  onClick(): void {
    if (this.clickable()) {
      this.clickedEmitter.emit();
    }
  }
}
