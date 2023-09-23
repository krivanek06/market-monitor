import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { LargeNumberFormatterPipe } from '@market-monitor/shared-pipes';
import { SheetData } from '../../../../../../data-access/src/lib/models';

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
