import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <h2 [class]="'text-wt-primary flex items-center gap-4 text-xl ' + additionalClasses()">
      <mat-icon *ngIf="matIcon()" color="primary">{{ matIcon() }}</mat-icon>
      {{ title() }}
    </h2>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTitleComponent {
  matIcon = input<string | undefined>();
  title = input.required<string>();
  additionalClasses = input<string | undefined>();
}
