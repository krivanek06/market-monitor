import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CompanyFinancialsReport } from '@market-monitor/api-types';
import { SheetDataPeriod, SheetDataTimePeriodForm } from '@market-monitor/modules/market-stocks/data-access';

@Component({
  selector: 'app-stock-sheet-data-time-period',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatRadioModule],
  template: `
    <form [formGroup]="timePeriodGroup" class="flex items-center justify-between">
      <!-- time period -->
      <mat-radio-group formControlName="timePeriod" color="primary" aria-label="Select an option" class="flex gap-x-4">
        <mat-radio-button value="financialsAnnual">Annual</mat-radio-button>
        <mat-radio-button value="financialsQuarter">Quarter</mat-radio-button>
      </mat-radio-group>

      <!-- keys -->
      <mat-radio-group formControlName="sheetKey" color="primary" aria-label="Select an option" class="flex gap-x-4">
        <mat-radio-button value="balance">Balance Sheet</mat-radio-button>
        <mat-radio-button value="income">Income Statement</mat-radio-button>
        <mat-radio-button value="cash">Cash Flow</mat-radio-button>
      </mat-radio-group>
    </form>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StockSheetDataTimePeriodComponent),
      multi: true,
    },
  ],
})
export class StockSheetDataTimePeriodComponent implements OnInit, ControlValueAccessor {
  timePeriodGroup = new FormGroup({
    timePeriod: new FormControl<SheetDataPeriod>('financialsAnnual', { nonNullable: true }),
    sheetKey: new FormControl<keyof CompanyFinancialsReport>('balance', { nonNullable: true }),
  });

  onChange: (value: SheetDataTimePeriodForm) => void = () => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.timePeriodGroup.valueChanges.subscribe(() => {
      const values = this.timePeriodGroup.getRawValue();
      this.onChange(values);
    });
  }

  writeValue(obj: SheetDataTimePeriodForm): void {
    this.timePeriodGroup.patchValue(obj, { emitEvent: false });
  }
  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: StockSheetDataTimePeriodComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: StockSheetDataTimePeriodComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
