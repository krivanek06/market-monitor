import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Directive, OnInit, TemplateRef, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { dateIsNotWeekend, generateDatesArrayForMonth } from '@mm/shared/general-util';
import { RangeDirective } from '../../../directives';

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
    <div class="mb-10 flex flex-col justify-between gap-y-5 lg:flex-row lg:px-6">
      <div class="flex items-center gap-10">
        <!-- current date range -->
        <div class="max-lg:text-wt-gray-dark space-x-4 text-lg max-lg:flex-1 max-lg:text-center">
          <span>{{ dateRangeSignal()[0] | date: 'MMMM d, y' }}</span>
          <span>-</span>
          <span>{{ dateRangeSignal()[dateRangeSignal().length - 1] | date: 'MMMM d, y' }}</span>
        </div>
        <!-- current month button -->
        <button class="hidden lg:block" (click)="onCurrentMonthClick()" type="button" mat-stroked-button>
          Current Date
        </button>
      </div>

      <!-- left / right button -->
      <div class="flex items-center gap-10 max-lg:flex-1">
        <button (click)="onMonthChange('previous')" mat-button type="button" class="max-lg:flex-1">
          <mat-icon>navigate_before</mat-icon>
          Previous Month
        </button>
        <button (click)="onMonthChange('next')" mat-button type="button" class="max-lg:flex-1">
          Next Month
          <mat-icon iconPositionEnd>navigate_next</mat-icon>
        </button>
      </div>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <!-- display day name -->
      <div *ngRange="5; let i = index" class="text-wt-gray-dark mb-4 text-center text-base max-xl:hidden">
        {{ dateRangeSignal()[i] | date: 'EEEE' }}
      </div>

      <!-- showing border if not last line on the bottom -->
      <div
        *ngFor="let date of dateRangeSignal(); let i = index"
        class="xl:g-border-bottom border-wt-border min-h-[120px] p-2 max-xl:border"
        [ngClass]="{
          'xl:border-r': i % 5 !== 4,
          'xl:border-b':
            dateRangeSignal().length % 5 < dateRangeSignal().length - i &&
            (dateRangeSignal().length % 5 !== 0 || i < dateRangeSignal().length - 5),
        }"
      >
        <!-- display day -->
        <div class="mb-2 flex items-center justify-between xl:justify-end">
          <!-- display day name on smaller screen-->
          <span class="text-wt-gray-dark text-sm xl:hidden">
            {{ dateRangeSignal()[i] | date: 'EEEE, (MMM d.)' }}
          </span>

          <!-- display day number on large screen -->
          <span class="text-wt-gray-medium bg-wt-gray-light h-9 w-9 rounded-full p-2 text-center max-xl:hidden">
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
  // todo - if enabled - always skeleton is displayed
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

  private readonly selectedDate = signal<CalendarRange>(CalendarRageToday);

  /**
   * displayed dates in the calendar month
   */
  readonly dateRangeSignal = signal<string[]>([]);

  onChange: (value: CalendarRange) => void = () => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.initDateRange();
  }

  writeValue(values: CalendarRange): void {
    this.selectedDate.set(values);
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
    const selectedDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
    this.selectedDate.set(selectedDate);
    this.initDateRange();
    this.onChange(this.selectedDate());
  }

  onMonthChange(value: 'next' | 'previous'): void {
    const { year, month } = this.selectedDate();
    if (value === 'next') {
      const selectedDate = {
        year: month === 12 ? year + 1 : year,
        month: month === 12 ? 1 : month + 1,
      };
      this.selectedDate.set(selectedDate);
    } else {
      const selectedDate = {
        year: month === 1 ? year - 1 : year,
        month: month === 1 ? 12 : month - 1,
      };
      this.selectedDate.set(selectedDate);
    }
    this.initDateRange();
    this.onChange(this.selectedDate());
  }

  private initDateRange(): void {
    this.dateRangeSignal.set(
      generateDatesArrayForMonth({
        year: this.selectedDate().year,
        month: this.selectedDate().month,
      }).filter((d) => dateIsNotWeekend(d)),
    );
  }
}
