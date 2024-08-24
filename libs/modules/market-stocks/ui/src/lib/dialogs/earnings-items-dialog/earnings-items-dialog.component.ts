import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarStockEarning, StockEarning } from '@mm/api-types';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { EarningsItemComponent } from '../../components';

@Component({
  selector: 'app-earnings-items-dialog',
  standalone: true,
  imports: [MatDialogModule, DialogCloseHeaderComponent, EarningsItemComponent],
  template: `
    <app-dialog-close-header [title]="dialogTitle" />

    <mat-dialog-content>
      <div class="mb-2 flex items-center justify-between">
        <div></div>
        <div class="space-x-4">
          <span>Earnings</span>
          <span>/</span>
          <span>Revenue</span>
        </div>
      </div>
      @for (earning of data.earnings; track earning.date; let last = $last) {
        <app-earnings-item
          (itemClickedEmitter)="onEarningsClicked(earning)"
          [earning]="earning"
          [showBorder]="!last"
          [showRevenue]="true"
        />
      }
    </mat-dialog-content>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
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
