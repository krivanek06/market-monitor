import { Pipe, PipeTransform } from '@angular/core';
import { formatLargeNumber } from '@market-monitor/shared/utils-general';

@Pipe({
  name: 'largeNumberFormatter',
  standalone: true,
})
export class LargeNumberFormatterPipe implements PipeTransform {
  transform(value?: string | number | null | unknown, isPercent = false, showDollarSign = false): unknown {
    return formatLargeNumber(value, isPercent, showDollarSign);
  }
}
