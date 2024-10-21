import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [MatIconModule, NgClass],
  template: `
    <div class="flex items-center justify-between">
      <!-- left side -->
      <div class="flex-1">
        <h2
          class="text-wt-primary flex items-center gap-4"
          [ngClass]="{
            'text-lg': titleSize() === 'lg',
            'text-base': titleSize() === 'base',
            'text-xl': titleSize() === 'xl',
          }"
        >
          @if (matIcon()) {
            <mat-icon color="primary">{{ matIcon() }}</mat-icon>
          }
          {{ title() }}
        </h2>

        @if (description()) {
          <p class="text-wt-gray-medium text-sm">{{ description() }}</p>
        }
      </div>

      <!-- right side -->
      <div>
        <ng-content />
      </div>
    </div>
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
  readonly titleSize = input<'xl' | 'lg' | 'base'>('xl');
  readonly description = input<string | undefined>();
}
