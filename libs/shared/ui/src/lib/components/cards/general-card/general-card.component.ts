import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-general-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-card appearance="outlined" [class]="additionalClasses() + ' ' + 'h-full shadow-md'">
      <!-- title -->
      <mat-card-header *ngIf="title()" [ngClass]="{ 'justify-center': titleCenter() }">
        <mat-card-title class="flex items-center gap-2">
          <img *ngIf="titleImgUrl()" appDefaultImg [src]="titleImgUrl()" />
          <mat-icon *ngIf="matIcon()" color="primary">{{ matIcon() }}</mat-icon>
          <h2 class="mb-0 text-wt-primary text-lg">
            {{ title() }}
          </h2>
        </mat-card-title>
      </mat-card-header>

      <!-- content -->
      <mat-card-content #matContent>
        @if (showLoadingState()) {
          <div class="grid place-content-center">
            <mat-spinner></mat-spinner>
          </div>
        } @else {
          <!-- default content -->
          @if (!contentRef()?.nativeElement?.innerHTML?.trim()) {
            <div class="text-wt-gray-medium min-h-[150px] grid place-content-center">No data has been found</div>
          }
          <!-- custom content -->
          <span #ref>
            <ng-content></ng-content>
          </span>
        }
      </mat-card-content>
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
})
export class GeneralCardComponent {
  contentRef = viewChild('ref', { read: ElementRef });

  title = input<string | null>(null);
  titleImgUrl = input<string | undefined>();
  matIcon = input<string | undefined>();
  additionalClasses = input('');
  titleCenter = input(false);
  showLoadingState = input(false);
}
