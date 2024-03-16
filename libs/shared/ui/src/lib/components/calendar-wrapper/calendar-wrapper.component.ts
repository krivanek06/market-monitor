import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Directive, OnInit, TemplateRef, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { dateIsNotWeekend, generateDatesArrayForMonth } from '@mm/shared/general-util';
import { RangeDirective } from '../../directives';

export type CalendarRange = { year: number; month: number };
export const CalendarRageToday = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
};

@Directive({
  selector: '[marker]',
  standalone: true,
})
export class MarkerDirective {}

@Component({
  selector: 'app-calendar-wrapper',
  standalone: true,
  imports: [CommonModule, RangeDirective, MatButtonModule, MatIconModule, MarkerDirective],
  template: `
    <div class="flex flex-col justify-between px-6 mb-10 md:flex-row gap-y-3">
      <div class="flex items-center gap-10">
        <!-- current date range -->
        <div class="justify-between space-x-4 text-wt-gray-medium max-md:flex max-md:flex-1">
          <span>{{ dateRangeSignal()[0] | date: 'MMMM d, y' }}</span>
          <span>-</span>
          <span>{{ dateRangeSignal()[dateRangeSignal().length - 1] | date: 'MMMM d, y' }}</span>
        </div>
        <!-- current month button -->
        <button class="hidden md:block" (click)="onCurrentMonthClick()" type="button" mat-stroked-button>
          Current Date
        </button>
      </div>

      <!-- left / right button -->
      <div class="flex items-center gap-10 max-md:flex-1">
        <button (click)="onMonthChange('previous')" mat-button type="button" class="max-md:flex-1">
          <mat-icon>navigate_before</mat-icon>
          Previous Month
        </button>
        <button (click)="onMonthChange('next')" mat-button type="button" class="max-md:flex-1">
          Next Month
          <mat-icon iconPositionEnd>navigate_next</mat-icon>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-5">
      <!-- display day name -->
      <div *ngRange="5; let i = index" class="mb-4 text-base text-center text-wt-gray-medium">
        {{ dateRangeSignal()[i] | date: 'EEEE' }}
      </div>

      <!-- showing border if not last line on the bottom -->
      <div
        *ngFor="let date of dateRangeSignal(); let i = index"
        class="p-2 g-border-bottom"
        [ngClass]="{
          'border-r': i % 5 !== 4,
          'border-b':
            dateRangeSignal().length % 5 < dateRangeSignal().length - i &&
            (dateRangeSignal().length % 5 !== 0 || i < dateRangeSignal().length - 5)
        }"
      >
        <!-- display day -->
        <div class="flex justify-end mb-2">
          <span class="p-2 text-center rounded-full text-wt-gray-medium w-9 h-9 bg-wt-gray-light">
            {{ dateRangeSignal()[i] | date: 'd' }}
          </span>
        </div>

        <!-- using an ng-container allows us to render the template without any additional wrapping -->
        <div *ngIf="templates.length >= i">
          <!-- using this hacky way because  templates[index] does not work -->
          <ng-container *ngFor="let tmpl of templates; let tmplIndex = index">
            <ng-container *ngIf="tmplIndex === i" [ngTemplateOutlet]="tmpl"></ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  //changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarWrapperComponent),
      multi: true,
    },
  ],
})
export class CalendarWrapperComponent implements OnInit, ControlValueAccessor {
  @ContentChildren(MarkerDirective, { read: TemplateRef }) templates!: TemplateRef<any>[];

  selectedDate = CalendarRageToday;
  dateRangeSignal = signal<string[]>([]);

  onChange: (value: CalendarRange) => void = () => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.initDateRange();
  }

  writeValue(values: CalendarRange): void {
    this.selectedDate = values;
    this.initDateRange();
  }
  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: CalendarWrapperComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: CalendarWrapperComponent['onTouched']): void {
    this.onTouched = fn;
  }

  onCurrentMonthClick(): void {
    this.selectedDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
    this.initDateRange();
    this.onChange(this.selectedDate);
  }

  onMonthChange(value: 'next' | 'previous'): void {
    const { year, month } = this.selectedDate;
    if (value === 'next') {
      const selectedDate = {
        year: month === 12 ? year + 1 : year,
        month: month === 12 ? 1 : month + 1,
      };
      this.selectedDate = selectedDate;
    } else {
      const selectedDate = {
        year: month === 1 ? year - 1 : year,
        month: month === 1 ? 12 : month - 1,
      };
      this.selectedDate = selectedDate;
    }
    this.initDateRange();
    this.onChange(this.selectedDate);
  }

  private initDateRange(): void {
    this.dateRangeSignal.set(
      generateDatesArrayForMonth({
        year: this.selectedDate.year,
        month: this.selectedDate.month,
      }).filter((d) => dateIsNotWeekend(d)),
    );
  }
}
