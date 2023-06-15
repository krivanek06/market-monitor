import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PercentageIncreaseDirective } from '@market-monitor/directives';
import { PriceChange } from '@market-monitor/shared-types';
import { PriceChangeItemSelectorPipe } from './price-change-item-selector.pipe';

@Component({
  selector: 'app-price-change-items',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, PriceChangeItemSelectorPipe],
  templateUrl: './price-change-items.component.html',
  styleUrls: ['./price-change-items.component.scss'],
})
export class PriceChangeItemsComponent {
  @Input({ required: true }) mainSymbolPriceChange!: PriceChange;
  @Input() additionalSymbolPriceChange?: PriceChange | null = null;

  priceChangeKeys: Array<{ key: keyof PriceChange; label: string }> = [
    { key: '1D', label: '1 day' },
    { key: '1M', label: '1 month' },
    { key: '3M', label: '3 months' },
    { key: '6M', label: '6 months' },
    { key: '1Y', label: '1 year' },
    { key: '3Y', label: '3 years' },
    { key: '5Y', label: '5 years' },
  ];
}
