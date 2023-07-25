import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-sheet-data-time-period',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-sheet-data-time-period.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockSheetDataTimePeriodComponent {}
