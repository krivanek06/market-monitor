import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-general-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    mat-card-content {
      height: inherit;
      padding-top: 0 !important;
    }

    .default {
      display: grid;
      min-height: 200px;
      place-content: center;
    }

    .default:not(:only-child) {
      display: none !important;
    }
  `,
  template: `
    <mat-card
      appearance="outlined"
      [class]="additionalClasses() + ' ' + cardColor() + ' ' + 'h-full'"
      [ngClass]="{
        'shadow-md': useShadow()
      }"
    >
      <!-- title -->
      <mat-card-header *ngIf="title()" [ngClass]="{ 'justify-center': titleCenter() }">
        <mat-card-title class="mb-2 flex items-center gap-2">
          <img *ngIf="titleImgUrl()" appDefaultImg [src]="titleImgUrl()" />
          <mat-icon *ngIf="matIcon()" color="primary">{{ matIcon() }}</mat-icon>
          <h2
            class="mb-0 text-wt-primary text-base"
            [ngClass]="{
              'text-xl': titleScale() === 'large',
              'text-base': titleScale() === 'medium',
              'text-sm': titleScale() === 'small'
            }"
          >
            {{ title() }}
          </h2>
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
  title = input<string | null>(null);
  titleImgUrl = input<string | undefined>();
  matIcon = input<string | undefined>();
  titleScale = input<'small' | 'medium' | 'large'>('medium');
  useShadow = input(true);
  additionalClasses = input('');
  titleCenter = input(false);
  cardColor = input<'bg-wt-gray-medium' | 'bg-wt-gray-light-strong' | 'bg-wt-gray-light'>('bg-wt-gray-light');
}
