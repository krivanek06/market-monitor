import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <h2 class="text-wt-primary flex items-center gap-4 text-xl">
      @if (matIcon()) {
        <mat-icon color="primary">{{ matIcon() }}</mat-icon>
      }
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
  readonly matIcon = input<string | undefined>();
  readonly title = input.required<string>();
}
