import { CommonModule } from '@angular/common';
import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SymbolHistoricalPeriods } from '@mm/api-types';

export const timePeriodDefaultButtons = [
  { labelButton: '1D', labelSelect: '1 day', value: SymbolHistoricalPeriods.day },
  { labelButton: '1W', labelSelect: '1 week', value: SymbolHistoricalPeriods.week },
  { labelButton: '1M', labelSelect: '1 month', value: SymbolHistoricalPeriods.month },
  //  { labelButton: '3M', labelSelect: '3 months', value: SymbolHistoricalPeriods.threeMonths },
  { labelButton: '6M', labelSelect: '6 months', value: SymbolHistoricalPeriods.sixMonths },
  { labelButton: '1Y', labelSelect: '1 year', value: SymbolHistoricalPeriods.year },
  { labelButton: '5Y', labelSelect: '5 years', value: SymbolHistoricalPeriods.fiveYears },
  { labelButton: 'YTD', labelSelect: 'year to date', value: SymbolHistoricalPeriods.ytd },
  { labelButton: 'ALL', labelSelect: 'All', value: SymbolHistoricalPeriods.all },
] as const;

@Component({
  selector: 'app-time-period-buttons',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <!-- large screen buttons -->
    <div class="hidden flex-wrap items-center gap-3 md:flex">
      <button
        *ngFor="let period of displayTimePeriods()"
        mat-stroked-button
        type="button"
        class="min-h-[36px] flex-1"
        [color]="period.value === activeTimePeriod.value ? 'primary' : ''"
        (click)="onTimePeriodSelect(period.value)"
      >
        {{ period.labelButton }}
      </button>
    </div>

    <!-- select on small screen -->
    <mat-form-field class="block w-full md:hidden">
      <mat-label>Time Period</mat-label>
      <mat-select [value]="activeTimePeriod.value" (selectionChange)="onTimePeriodSelect($event.value)">
        <mat-option *ngFor="let period of displayTimePeriods()" [value]="period.value">
          {{ period.labelSelect }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePeriodButtonsComponent),
      multi: true,
    },
  ],
})
export class TimePeriodButtonsComponent implements ControlValueAccessor {
  readonly displayTimePeriods = input(timePeriodDefaultButtons);

  readonly activeTimePeriod = new FormControl<SymbolHistoricalPeriods | null>(null);

  onChange: (data: SymbolHistoricalPeriods) => void = () => {};
  onTouched = () => {};

  onTimePeriodSelect(period: SymbolHistoricalPeriods): void {
    this.activeTimePeriod.patchValue(period);
    this.onChange(period);
  }

  writeValue(value: SymbolHistoricalPeriods): void {
    this.activeTimePeriod.patchValue(value);
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: TimePeriodButtonsComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: TimePeriodButtonsComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
