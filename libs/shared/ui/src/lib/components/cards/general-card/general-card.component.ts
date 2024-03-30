import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, contentChild, input } from '@angular/core';
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
    }
  `,
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
      <mat-card-content>
        <!-- default content -->
        @if (cardContent()?.nativeElement.childNodes.length === 0) {
          <div class="text-wt-gray-medium min-h-[200px] grid place-content-center">No data has been found</div>
        }
        <!-- custom content -->
        <ng-content #cardContent></ng-content>
      </mat-card-content>
    </mat-card>
  `,
})
export class GeneralCardComponent {
  title = input<string | null>(null);
  titleImgUrl = input<string | undefined>();
  matIcon = input<string | undefined>();
  additionalClasses = input('');
  titleCenter = input(false);

  cardContent = contentChild('cardContent', { read: ElementRef });
}
