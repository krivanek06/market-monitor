import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarDividend, CompanyStockDividend } from '@market-monitor/api-types';
import { DialogCloseHeaderComponent } from '@market-monitor/shared-components';
import { DividendItemComponent } from '../../components';

@Component({
  selector: 'app-dividend-items-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DialogCloseHeaderComponent, DividendItemComponent],
  templateUrl: './dividend-items-dialog.component.html',
  styleUrls: ['./dividend-items-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class DividendItemsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DividendItemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dividends: (CalendarDividend | CompanyStockDividend)[]; showDate: boolean },
    private datePipe: DatePipe,
  ) {}

  get dialogTitle(): string {
    return this.data.showDate && this.data.dividends.length > 0
      ? `Dividends: ${this.datePipe.transform(this.data.dividends[0].date, 'd. MMMM, y (EEEE)')}`
      : 'Dividends';
  }

  onDividendClicked(dividend: CalendarDividend | CompanyStockDividend): void {
    this.dialogRef.close({ dividend });
  }
}
