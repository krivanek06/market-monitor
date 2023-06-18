import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-general-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header *ngIf="title || subtitle">
        <mat-card-title *ngIf="title">{{ title | titlecase }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle">{{
          subtitle | titlecase
        }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>
    </mat-card>
  `,
})
export class GeneralCardComponent {
  @Input() title?: string | null;
  @Input() subtitle?: string | null;
}
