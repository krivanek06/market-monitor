import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarDividend, CompanyStockDividend } from '@mm/api-types';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { DividendItemComponent } from '../../components';

@Component({
  selector: 'app-dividend-items-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DialogCloseHeaderComponent, DividendItemComponent],
  template: `
    <app-dialog-close-header [title]="dialogTitle"></app-dialog-close-header>

    <mat-dialog-content>
      <app-dividend-item
        *ngFor="let dividend of data.dividends; let last = last"
        (itemClickedEmitter)="onDividendClicked(dividend)"
        [dividend]="dividend"
        [showBorder]="!last"
      ></app-dividend-item>
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
