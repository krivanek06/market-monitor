import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SheetData } from '@market-monitor/modules/market-stocks/data-access';
import { LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-sheet-data-table',
  standalone: true,
  imports: [CommonModule, LargeNumberFormatterPipe, PercentageIncreaseDirective],
  templateUrl: './stock-sheet-data-table.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSheetDataTableComponent {
  @Input({ required: true }) data!: SheetData;
}
