import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <h2 [class]="'flex items-center gap-4 text-xl text-wt-primary ' + additionalClasses">
      <mat-icon *ngIf="matIcon" color="primary">{{ matIcon }}</mat-icon>
      {{ title }}
    </h2>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTitleComponent {
  @Input() matIcon?: string;
  @Input({ required: true }) title!: string;
  @Input() additionalClasses?: string;
}
