import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-general-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      mat-card-content {
        height: inherit;

        .default {
          @apply grid min-h-[200px] place-content-center;

          &:not(:only-child) {
            display: none !important;
          }
        }
      }
    `,
  ],
  template: `
    <mat-card
      appearance="outlined"
      [class]="additionalClasses"
      [ngClass]="{
        'shadow-md': showDataInCard,
        'bg-wt-gray-light': showDataInCard,
        'bg-wt-gray-light-strong': !showDataInCard
      }"
    >
      <!-- title -->
      <mat-card-header *ngIf="title" [ngClass]="{ 'justify-center': titleCenter }">
        <mat-card-title class="mb-0">
          <img *ngIf="titleImgUrl" appDefaultImg [src]="titleImgUrl" />
          <h3 class="mb-0 text-xl xl:text-2xl text-wt-primary">{{ title }}</h3>
        </mat-card-title>
      </mat-card-header>

      <!-- content -->
      <mat-card-content>
        <!-- default content -->
        <div class="default text-wt-gray-medium">No data has been found</div>

        <ng-content></ng-content>
      </mat-card-content>
    </mat-card>
  `,
})
export class GeneralCardComponent {
  @Input() title: string | null = null;
  @Input() titleImgUrl?: string;
  @Input() showDataInCard = false;
  @Input() additionalClasses = '';
  @Input() titleCenter = false;
}
