import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-position-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatRippleModule, MatIconModule],
  styles: `
      :host {
        display: block;
      }

      mat-card-content {
        height: inherit;
      }

      .c-position-wrapper {
        margin-left: 5px;
        font-size: 18px;
      }

      .c-position-first-bg {
        background: linear-gradient(
          135deg,
          color-mix(in srgb, #e44736 50%, white),
          color-mix(in srgb, #f31903 35%, white)
        );

        .c-position {
          color: #f31903;
        }
      }

      .c-position-second-bg {
        background: linear-gradient(
          135deg,
          color-mix(in srgb, #f0a14d 50%, white),
          color-mix(in srgb, #c76f12 35%, white)
        );

        .c-position {
          color: #c76f12;
        }
      }

      .c-position-third-bg {
        background: linear-gradient(
          135deg,
          color-mix(in srgb, #31a5f7 50%, white),
          color-mix(in srgb, #0272c2 35%, white)
        );

        .c-position {
          color: #0272c2;
        }
      }

      .c-position-irrelevant {
        background-color: var(--gray-light-strong);

        .c-position {
          color: #8a0ba1;
        }
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card
      appearance="outlined"
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickable"
      [matRippleUnbounded]="false"
      class="shadow-md pt-8 pb-3 px-6"
      (click)="onClick()"
      [ngClass]="{
        'c-position-first-bg': currentPositions === 1,
        'c-position-second-bg': currentPositions === 2,
        'c-position-third-bg': currentPositions === 3,
        'c-position-irrelevant': currentPositions > 3,
        'g-clickable-hover': clickable
      }"
    >
      <div class="relative">
        <!-- position -->
        <div
          class="absolute -top-6 -left-4 h-10 z-10 rounded-full bg-slate-200 flex items-center gap-4 opacity-90 border border-wt-gray-light-strong"
          [ngClass]="{
            'w-10': !showPreviousPosition
          }"
        >
          <div class="c-position c-position-wrapper">#{{ currentPositions }}</div>
          <div
            *ngIf="showPreviousPosition"
            class="flex items-center"
            [ngClass]="{
              'text-wt-success': isPositionIncreased,
              'text-wt-danger': !isPositionIncreased
            }"
          >
            <span *ngIf="previousPosition">{{ previousPosition - currentPositions }}</span>
            <mat-icon *ngIf="isPositionIncreased" color="accent">expand_less</mat-icon>
            <mat-icon *ngIf="!isPositionIncreased" color="warn">expand_more</mat-icon>
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

  @Input({ required: true }) currentPositions!: number;
  @Input() previousPosition?: number | null;
  @Input() clickable = false;

  get showPreviousPosition(): boolean {
    return !!this.previousPosition && this.currentPositions !== this.previousPosition;
  }

  get isPositionIncreased(): boolean {
    return !!this.previousPosition && this.previousPosition - this.currentPositions > 0;
  }

  onClick(): void {
    if (this.clickable) {
      this.clickedEmitter.emit();
    }
  }
}
