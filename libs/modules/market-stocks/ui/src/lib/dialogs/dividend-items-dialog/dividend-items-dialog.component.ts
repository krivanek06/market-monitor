import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarDividend, CompanyStockDividend } from '@mm/api-types';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';
import { DividendItemComponent } from '../../components';

@Component({
  selector: 'app-dividend-items-dialog',
  standalone: true,
  imports: [MatDialogModule, DialogCloseHeaderComponent, DividendItemComponent],
  template: `
    <app-dialog-close-header [title]="dialogTitle" />

    <mat-dialog-content>
      @for (dividend of data.dividends; track dividend.symbol; let last = $last) {
        <app-dividend-item
          (itemClickedEmitter)="onDividendClicked(dividend)"
          [dividend]="dividend"
          [showBorder]="!last"
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
export class DividendItemsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DividendItemsDialogComponent>);
  private readonly datePipe = inject(DatePipe);
  readonly data = inject<{ dividends: (CalendarDividend | CompanyStockDividend)[]; showDate: boolean }>(
    MAT_DIALOG_DATA,
  );

  get dialogTitle(): string {
    return this.data.showDate && this.data.dividends.length > 0
      ? `Dividends: ${this.datePipe.transform(this.data.dividends[0].date, 'd. MMMM, y (EEEE)')}`
      : 'Dividends';
  }

  onDividendClicked(dividend: CalendarDividend | CompanyStockDividend): void {
    this.dialogRef.close({ dividend });
  }
}
