import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SheetData } from '@market-monitor/modules/market-stocks/data-access';
import { LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-sheet-data-table',
  standalone: true,
  imports: [CommonModule, LargeNumberFormatterPipe, PercentageIncreaseDirective],
  template: `
    <table>
      <thead>
        <tr>
          <th></th>
          <th *ngFor="let period of data.timePeriods" class="hidden sm:table-cell">
            {{ period }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let block of data.data">
          <!-- name -->
          <td class="text-wt-gray-dark">{{ block.name }}</td>
          <!-- values -->
          <td *ngFor="let value of block.values; let i = index; let last = last">
            <div class="flex items-center gap-2">
              <span>{{ value | largeNumberFormatter: block.isPercentage : false }}</span>
              <span
                *ngIf="!last && value !== 0"
                appPercentageIncrease
                [currentValues]="{
                  hideValue: true,
                  value: value,
                  valueToCompare: block.values[i + 1]
                }"
              ></span>
            </div>
          </td>
        </tr>
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
  @Input({ required: true }) data!: SheetData;
}
