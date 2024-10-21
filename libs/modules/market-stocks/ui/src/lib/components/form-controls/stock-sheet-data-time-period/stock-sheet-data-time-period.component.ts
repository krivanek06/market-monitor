import { ChangeDetectionStrategy, Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CompanyFinancialsReport } from '@mm/api-types';
import { SheetDataPeriod, SheetDataTimePeriodForm } from '@mm/market-stocks/data-access';

@Component({
  selector: 'app-stock-sheet-data-time-period',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule],
  template: `
    <form [formGroup]="timePeriodGroup" class="flex flex-col gap-y-3 lg:flex-row lg:items-center lg:justify-between">
      <!-- time period -->
      <mat-radio-group
        [formControl]="timePeriodGroup.controls.timePeriod"
        color="primary"
        aria-label="Select an option"
        class="flex gap-x-4 max-lg:justify-between max-lg:[&>*]:w-[200px] max-sm:[&>*]:flex-1"
      >
        <mat-radio-button value="financialsAnnual">Annual</mat-radio-button>
        <mat-radio-button value="financialsQuarter">Quarter</mat-radio-button>
      </mat-radio-group>

      <!-- keys -->
      <mat-radio-group
        [formControl]="timePeriodGroup.controls.sheetKey"
        color="primary"
        aria-label="Select an option"
        class="flex gap-x-2 sm:gap-x-6 max-lg:[&>*]:flex-1"
      >
        <mat-radio-button value="balance">Balance <span class="max-sm:hidden">Sheet</span></mat-radio-button>
        <mat-radio-button value="income">Income <span class="max-sm:hidden">Statement</span></mat-radio-button>
        <mat-radio-button value="cash">Cash <span class="max-sm:hidden">Flow</span></mat-radio-button>
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
  readonly timePeriodGroup = new FormGroup({
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
