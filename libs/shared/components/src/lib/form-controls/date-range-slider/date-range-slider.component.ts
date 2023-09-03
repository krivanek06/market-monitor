import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { GetDataByIndexPipe } from '@market-monitor/shared-pipes';

export type DateRangeSliderValues = {
  dates: (Date | string)[];
  currentMinDateIndex: number;
  currentMaxDateIndex: number;
};

@Component({
  selector: 'app-date-range-slider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSliderModule, GetDataByIndexPipe],
  templateUrl: './date-range-slider.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangeSliderComponent),
      multi: true,
    },
  ],
})
export class DateRangeSliderComponent implements ControlValueAccessor {
  dateRangeSignal = signal<DateRangeSliderValues | null>(null);

  onChange: (data: DateRangeSliderValues) => void = () => {};
  onTouched = () => {};

  onSliderValueChange(index: number, slider: 'start' | 'end'): void {
    const previousValue = this.dateRangeSignal();
    if (!previousValue) {
      return;
    }

    // prevent starting value to be greater than ending value
    if (slider === 'start' && index > previousValue.currentMaxDateIndex) {
      return;
    }

    // prevent ending value to be less than starting value
    if (slider === 'end' && index < previousValue.currentMinDateIndex) {
      return;
    }

    // set values into signal
    const newValues = {
      ...previousValue,
      currentMinDateIndex: slider === 'start' ? index : previousValue.currentMinDateIndex,
      currentMaxDateIndex: slider === 'end' ? index : previousValue.currentMaxDateIndex,
    } satisfies DateRangeSliderValues;

    this.dateRangeSignal.set(newValues);

    // notify parent
    this.onChange(newValues);
  }

  writeValue(value: DateRangeSliderValues | null): void {
    if (!value) {
      return;
    }

    this.dateRangeSignal.set(value);
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: DateRangeSliderComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: DateRangeSliderComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
