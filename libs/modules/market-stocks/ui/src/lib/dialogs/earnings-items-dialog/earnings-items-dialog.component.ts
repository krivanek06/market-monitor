import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarStockEarning, StockEarning } from '@mm/api-types';
import { isScreenLarger } from '@mm/shared/data-access';
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
      @for (earning of data.earnings; track $index; let last = $last) {
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
  private readonly dialogRef = inject(MatDialogRef<EarningsItemsDialogComponent>);
  private readonly datePipe = inject(DatePipe);
  readonly data = inject<{ earnings: (StockEarning | CalendarStockEarning)[]; showDate: boolean }>(MAT_DIALOG_DATA);

  get dialogTitle(): string {
    // different formatting on smaller screen
    const format = isScreenLarger('LAYOUT_SM') ? 'd. MMMM, y (EEEE)' : 'd. MMM, y';
    return this.data.showDate && this.data.earnings.length > 0
      ? `Earnings: ${this.datePipe.transform(this.data.earnings[0].date, format)}`
      : 'Earnings';
  }

  onEarningsClicked(earning: StockEarning | CalendarStockEarning): void {
    this.dialogRef.close({ earning });
  }
}
