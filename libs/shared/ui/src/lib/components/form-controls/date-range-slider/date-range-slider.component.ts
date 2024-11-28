import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { addDays, isAfter, isBefore, subDays } from 'date-fns';
import { GetDataByIndexPipe } from '../../../pipes';

export type DateRangeSliderValues = {
  dates: (Date | string)[]; // YYYY-MM-DD
  currentMinDateIndex: number;
  currentMaxDateIndex: number;
};

/**
 * use this function if data is in the format of { date: string }[]
 */
export const filterDataByDateRange = <T extends { date: string }>(
  data: T[],
  dateRange: DateRangeSliderValues | null,
): T[] => {
  if (!dateRange) {
    return data;
  }
  return data.filter(
    (d) =>
      isBefore(subDays(new Date(d.date), 1), new Date(dateRange.dates[dateRange.currentMaxDateIndex])) &&
      isAfter(addDays(new Date(d.date), 1), new Date(dateRange.dates[dateRange.currentMinDateIndex])),
  );
};

export const filterDataByIndexRange = <T extends { date: string }>(
  data: T[],
  dateRange: DateRangeSliderValues | null,
): T[] => {
  if (!dateRange) {
    return data;
  }
  return data.filter(
    (d) => Number(d.date) <= dateRange.currentMaxDateIndex && Number(d.date) >= dateRange.currentMinDateIndex,
  );
};

/**
 * use this function if data is in the format of [timestamp, ...number[]]
 */
export const filterDataByTimestamp = <T extends [number, ...number[]]>(
  data: T[],
  dateRange: DateRangeSliderValues | null,
): T[] => {
  if (!dateRange) {
    return data;
  }

  return data.filter(
    (d) =>
      isBefore(subDays(new Date(d[0]), 1), new Date(dateRange.dates[dateRange.currentMaxDateIndex])) &&
      isAfter(addDays(new Date(d[0]), 1), new Date(dateRange.dates[dateRange.currentMinDateIndex])),
  );
};

@Component({
  selector: 'app-date-range-slider',
  standalone: true,
  imports: [ReactiveFormsModule, MatSliderModule, GetDataByIndexPipe, DatePipe],
  template: `
    @if (dateRangeSignal(); as values) {
      <div class="flex w-full flex-col">
        <!-- display slider and min/max values -->
        <div class="flex w-full items-center gap-4">
          <!-- min value -->
          <span class="text-wt-gray-medium text-xs max-sm:hidden">
            <!-- current date -->
            @if (filterType() === 'date') {
              {{ values.dates | getDataByIndex: values.currentMinDateIndex | date: 'MMM d, y' }}
            } @else {
              Round: {{ values.dates | getDataByIndex: values.currentMinDateIndex }}
            }
          </span>

          <!-- slider -->
          <mat-slider class="g-custom-slider flex-1" [min]="0" [max]="values.dates.length - 1" showTickMarks>
            <input
              (valueChange)="onSliderValueChange($event, 'start')"
              [value]="values.currentMinDateIndex"
              matSliderStartThumb
            />
            <input
              (valueChange)="onSliderValueChange($event, 'end')"
              [value]="values.currentMaxDateIndex"
              matSliderEndThumb
            />
          </mat-slider>

          <!-- max value -->
          <span class="text-wt-gray-medium text-xs max-sm:hidden">
            <!-- current date -->
            @if (filterType() === 'date') {
              {{ values.dates | getDataByIndex: values.currentMaxDateIndex | date: 'MMM d, y' }}
            } @else {
              Round: {{ values.dates | getDataByIndex: values.currentMaxDateIndex }}
            }
          </span>
        </div>
      </div>
    }
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
      useExisting: forwardRef(() => DateRangeSliderComponent),
      multi: true,
    },
  ],
})
export class DateRangeSliderComponent implements ControlValueAccessor {
  readonly dateRangeSignal = signal<DateRangeSliderValues | null>(null);
  /**
   * date - filter by date,
   * round - filter by index
   */
  readonly filterType = input<'date' | 'round'>('date');

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

    // set values into signal
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
