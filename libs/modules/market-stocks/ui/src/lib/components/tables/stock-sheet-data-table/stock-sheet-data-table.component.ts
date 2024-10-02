import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SheetData } from '@mm/market-stocks/data-access';
import { LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-sheet-data-table',
  standalone: true,
  imports: [LargeNumberFormatterPipe, PercentageIncreaseDirective],
  template: `
    <table>
      <thead>
        <tr>
          <th></th>
          @for (period of data().timePeriods; track period) {
            <th class="px-4">
              {{ period }}
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @for (block of data().data; track $index) {
          <tr>
            <!-- name -->
            <td class="text-wt-gray-dark">{{ block.name }}</td>
            <!-- values -->
            @for (value of block.values; track $index; let i = $index; let last = $last) {
              <td class="px-4">
                <div class="flex items-center gap-2">
                  <span>{{ value | largeNumberFormatter: block.isPercentage : false }}</span>
                  @if (!last && value !== 0) {
                    <span
                      appPercentageIncrease
                      [currentValues]="{
                        hideValue: true,
                        value: value,
                        valueToCompare: block.values[i + 1],
                      }"
                    ></span>
                  }
                </div>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSheetDataTableComponent {
  readonly data = input.required<SheetData>();
}
