import { Pipe, PipeTransform } from '@angular/core';
import { PriceChange } from '@market-monitor/api-types';

@Pipe({
  name: 'priceChangeItemSelector',
  standalone: true,
})
export class PriceChangeItemSelectorPipe implements PipeTransform {
  transform(priceChange: PriceChange | null, key: keyof PriceChange): number | null {
    return priceChange ? (priceChange[key] as number) : null;
  }
}
