import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, forwardRef, signal } from '@angular/core';
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
  imports: [CommonModule, ReactiveFormsModule, MatSliderModule, GetDataByIndexPipe],
  template: `
    <div *ngIf="dateRangeSignal() as values" class="flex flex-col w-full">
      <!-- display current value from form -->
      <div *ngIf="displayUpperDate" class="hidden sm:flex items-center justify-center gap-3">
        <span class="text-sm text-wt-gray-medium">
          {{ values.dates | getDataByIndex: values.currentMinDateIndex | date: 'MMM d, y' }}
        </span>
        <span>-</span>
        <span class="text-sm text-wt-gray-medium">
          {{ values.dates | getDataByIndex: values.currentMaxDateIndex | date: 'MMM d, y' }}
        </span>
      </div>

      <!-- display slider and min/max values -->
      <div class="flex items-center w-full gap-4">
        <!-- min value -->
        <span class="max-sm:hidden text-sm text-wt-gray-medium">
          <!-- min date -->
          <ng-container *ngIf="displayUpperDate">
            {{ values.dates | getDataByIndex: 0 | date: 'MMM d, y' }}
          </ng-container>
          <!-- current date -->
          <ng-container *ngIf="!displayUpperDate">
            {{ values.dates | getDataByIndex: values.currentMinDateIndex | date: 'MMM d, y' }}
          </ng-container>
        </span>

        <!-- slider -->
        <mat-slider class="flex-1" [min]="0" [max]="values.dates.length - 1" showTickMarks>
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
        <span class="max-sm:hidden text-sm text-wt-gray-medium">
          <!-- max date -->
          <ng-container *ngIf="displayUpperDate">
            {{ values.dates | getDataByIndex: values.dates.length - 1 | date: 'MMM d, y' }}
          </ng-container>
          <!-- current date -->
          <ng-container *ngIf="!displayUpperDate">
            {{ values.dates | getDataByIndex: values.currentMaxDateIndex | date: 'MMM d, y' }}
          </ng-container>
        </span>
      </div>
    </div>
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
  @Input() displayUpperDate = false;
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
