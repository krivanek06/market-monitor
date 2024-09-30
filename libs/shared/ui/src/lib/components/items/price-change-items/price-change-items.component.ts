import { Component, input } from '@angular/core';
import { PriceChange } from '@mm/api-types';
import { PercentageIncreaseDirective } from '../../../directives';
import { PriceChangeItemSelectorPipe } from './price-change-item-selector.pipe';

@Component({
  selector: 'app-price-change-items',
  standalone: true,
  imports: [PercentageIncreaseDirective, PriceChangeItemSelectorPipe],
  template: `
    <div class="grid grid-cols-2 justify-around gap-4 sm:grid-cols-3 md:flex md:flex-row md:flex-wrap">
      @for (keys of priceChangeKeys; track keys.key) {
        <div class="flex flex-row gap-x-4 gap-y-1 sm:flex-col">
          <!-- name => 1 day -->
          <span class="text-center">{{ keys.label }}</span>
          <!-- value -->
          <div class="flex items-center justify-center">
            <span
              appPercentageIncrease
              [changeValues]="{ changePercentage: mainSymbolPriceChange() | priceChangeItemSelector: keys.key }"
            ></span>
            @if (additionalSymbolPriceChange(); as additionalSymbolPriceChange) {
              <span>/</span>
              <span
                appPercentageIncrease
                [changeValues]="{ changePercentage: additionalSymbolPriceChange | priceChangeItemSelector: keys.key }"
              ></span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PriceChangeItemsComponent {
  readonly mainSymbolPriceChange = input.required<PriceChange>();
  readonly additionalSymbolPriceChange = input<PriceChange | null | undefined>(null);

  readonly priceChangeKeys: Array<{ key: keyof PriceChange; label: string }> = [
    //{ key: '1D', label: '1 day' },
    { key: '1M', label: '1 month' },
    { key: '3M', label: '3 months' },
    { key: '6M', label: '6 months' },
    { key: '1Y', label: '1 year' },
    { key: '3Y', label: '3 years' },
    { key: '5Y', label: '5 years' },
  ];
}
