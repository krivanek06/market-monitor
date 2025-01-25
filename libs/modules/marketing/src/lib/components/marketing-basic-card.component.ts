import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: 'app-marketing-basic-card',
  imports: [],
  template: `
    <div [class]="internalCssClasses()">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingBasicCardComponent {
  readonly additionalClassed = input<string>();
  readonly internalCssClasses = computed(() =>
    twMerge(
      'px-4 py-2 border border-cyan-800 border-solid bg-gray-900 rounded-lg bg-opacity-60',
      this.additionalClassed(),
    ),
  );
}
