import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [MatIconModule, NgClass],
  template: `
    <div class="flex items-center justify-between gap-x-10">
      <!-- left side -->
      <div class="flex flex-1 items-center gap-3">
        @if (matIcon()) {
          <mat-icon color="primary">{{ matIcon() }}</mat-icon>
        }

        <div>
          <h2
            class="text-wt-primary"
            [ngClass]="{
              'text-lg': titleSize() === 'lg',
              'text-base': titleSize() === 'base',
            }"
          >
            {{ title() }}
          </h2>

          @if (descriptionDisplay().length > 0) {
            @for (desc of descriptionDisplay(); track $index) {
              <p class="text-wt-gray-medium text-sm">{{ desc }}</p>
            }
          }
        </div>
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
  readonly titleSize = input<'lg' | 'base'>('lg');
  readonly description = input<string | string[] | undefined>();

  readonly descriptionDisplay = computed(() => {
    const description = this.description();

    return Array.isArray(description) ? description : [description];
  });
}
