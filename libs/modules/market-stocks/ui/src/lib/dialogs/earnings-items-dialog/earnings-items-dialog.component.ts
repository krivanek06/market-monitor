import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarStockEarning, StockEarning } from '@market-monitor/api-types';
import { DialogCloseHeaderComponent } from '@market-monitor/shared/ui';
import { EarningsItemComponent } from '../../components';

@Component({
  selector: 'app-earnings-items-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DialogCloseHeaderComponent, EarningsItemComponent],
  templateUrl: './earnings-items-dialog.component.html',
  styleUrls: ['./earnings-items-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class EarningsItemsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<EarningsItemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { earnings: (StockEarning | CalendarStockEarning)[]; showDate: boolean },
    private datePipe: DatePipe,
  ) {}

  get dialogTitle(): string {
    return this.data.showDate && this.data.earnings.length > 0
      ? `Earnings: ${this.datePipe.transform(this.data.earnings[0].date, 'd. MMMM, y (EEEE)')}`
      : 'Earnings';
  }

  onEarningsClicked(earning: StockEarning | CalendarStockEarning): void {
    this.dialogRef.close({ earning });
  }
}
