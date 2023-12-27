import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Directive, Input, OnInit, TemplateRef, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { dateIsNotWeekend, generateDatesArrayForMonth } from '@market-monitor/shared/features/general-util';
import { ClientStylesDirective, RangeDirective } from '../../directives';

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
  imports: [CommonModule, RangeDirective, MatButtonModule, MatIconModule, MarkerDirective, ClientStylesDirective],
  templateUrl: './calendar-wrapper.component.html',
  styleUrls: ['./calendar-wrapper.component.scss'],
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
  @Input() minHeight = 250;

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
