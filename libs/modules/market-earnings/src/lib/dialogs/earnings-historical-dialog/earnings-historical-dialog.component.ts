import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarStockEarning, StockEarning } from '@market-monitor/api-types';
import { DialogCloseHeaderComponent } from '@market-monitor/shared-components';
import { EarningsChartComponent } from '../../components';

@Component({
  selector: 'app-earnings-historical-dialog',
  standalone: true,
  imports: [CommonModule, EarningsChartComponent, MatDialogModule, DialogCloseHeaderComponent],
  templateUrl: './earnings-historical-dialog.component.html',
  styleUrls: ['./earnings-historical-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarningsHistoricalDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<EarningsHistoricalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { earnings: (StockEarning | CalendarStockEarning)[] }
  ) {}
}
