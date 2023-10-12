import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SymbolHistoricalPeriods } from '@market-monitor/api-types';
import { timePeriodDefaultButtons } from './time-period-buttons.model';

@Component({
  selector: 'app-time-period-buttons',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './time-period-buttons.component.html',
  styles: [
    `
      :host {
        display: block;
      }

      button[mat-stroked-button].mat-mdc-outlined-button.mat-unthemed {
        background-color: var(--gray-light) !important;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePeriodButtonsComponent),
      multi: true,
    },
  ],
})
export class TimePeriodButtonsComponent implements ControlValueAccessor {
  @Input() displayTimePeriods = timePeriodDefaultButtons;

  activeTimePeriod = new FormControl<SymbolHistoricalPeriods | null>(null);

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
