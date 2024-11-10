import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { DateFilterFn, MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMatTimepickerComponent, NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { filterNil } from 'ngxtension/filter-nil';
import { map, of, startWith, switchMap, tap } from 'rxjs';

export interface InputTypeDateTimePickerConfig {
  minDate?: Date | string;
  maxDate?: Date | string;
  dateFilter?: DateFilterFn<any>;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    NgxMatTimepickerModule,
  ],
  template: `
    <!-- hidden datepicker -->
    <mat-form-field class="invisible absolute">
      <input
        [min]="inputTypeDateTimePickerConfig()?.minDate"
        [max]="inputTypeDateTimePickerConfig()?.maxDate"
        matInput
        [matDatepicker]="datePicker"
        [matDatepickerFilter]="inputTypeDateTimePickerConfig()?.dateFilter ?? defaultDateFilter"
        [formControl]="selectedDate"
      />
      <mat-datepicker-toggle matSuffix [for]="datePicker" />
      <mat-datepicker #datePicker />
    </mat-form-field>

    <!-- hidden timepicker -->
    <mat-form-field class="invisible absolute">
      <input
        matInput
        [format]="24"
        [formControl]="selectedTime"
        [ngxMatTimepicker]="timePicker"
        placeholder="12:00"
        readonly
      />
      <ngx-mat-timepicker #timePicker color="primary" />
    </mat-form-field>

    <div class="flex gap-2">
      <!-- button to display datepicker -->
      <button
        [disabled]="isDisabled()"
        (click)="onDateToggle()"
        type="button"
        mat-flat-button
        class="h-12 w-full"
        [ngClass]="{
          'border-wt-danger': hasError(),
        }"
      >
        <span [ngClass]="{ 'text-wt-danger': hasError() }">
          {{ displayDateString() ?? 'Please select a date' }}
        </span>
        <mat-icon [color]="hasError() ? 'warn' : ''">calendar_month</mat-icon>
      </button>

      <!-- reset button -->
      @if (showCancelDate() && (selectedDate.value || selectedTime.value)) {
        <button mat-icon-button type="button" (click)="clearDate()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }

      ::ng-deep mat-datepicker-content {
        margin-top: 45px !important;
      }

      ::ng-deep mat-calendar {
        margin-top: -32px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  private readonly datePipe = inject(DatePipe);

  readonly inputTypeDateTimePickerConfig = input<InputTypeDateTimePickerConfig | undefined>();

  /** if true, set red borders */
  readonly hasError = input(false);
  readonly type = input<'date' | 'datetime'>('date');
  readonly showCancelDate = input(true);
  readonly roundToNear = input<null | '10_MINUTES' | 'QUARTER'>(null);

  readonly isDisabled = signal(false);

  readonly timePicker = viewChild('timePicker', { read: NgxMatTimepickerComponent });
  readonly datePicker = viewChild('datePicker', { read: MatDatepicker<any> });

  readonly selectedDate = new FormControl<Date | null>(null);

  /** selected time in format: HH:mm */
  readonly selectedTime = new FormControl<string | null>(null);

  readonly displayDateString = signal<string | null>(null);

  defaultDateFilter: DateFilterFn<any> = (d: Date) => true;

  onChange: (data: Date | null) => void = () => {
    /** */
  };
  onTouched = () => {
    /** */
  };

  constructor() {
    this.selectedDate.valueChanges
      .pipe(
        tap(() => this.onTouched()),
        filterNil(),
        // if type is date, return date value
        switchMap((date) =>
          this.type() === 'date'
            ? of(date)
            : of(date).pipe(
                // open time picker
                tap(() => this.timePicker()?.open()),
                // listen on time picker value changes
                switchMap((date) =>
                  this.selectedTime.valueChanges.pipe(
                    startWith(this.selectedTime.value),
                    map((time) => {
                      // no time selected
                      if (!time) {
                        return null;
                      }

                      // Split the time string into hours and minutes
                      const [hours, minutes] = time.split(':').map(Number);

                      // Set the hours and minutes of the date object
                      date.setHours(hours, minutes, 0, 0); // Reset seconds and milliseconds

                      // return modified date
                      return date;
                    }),
                  ),
                ),
              ),
        ),
        map((date) => {
          if (!date) {
            return null;
          }

          if (this.roundToNear() === '10_MINUTES') {
            const minutes = date.getMinutes();
            const roundedMinutes = Math.round(minutes / 10) * 10;
            date.setMinutes(roundedMinutes);
          }

          if (this.roundToNear() === 'QUARTER') {
            const minutes = date.getMinutes();
            const roundedMinutes = Math.round(minutes / 15) * 15;
            date.setMinutes(roundedMinutes);
          }

          return date;
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.onChange(res);
        this.displayDateString.set(this.formatDate(res));
      });
  }

  onDateToggle(): void {
    const datePicker = this.datePicker();
    const timePicker = this.timePicker();

    // not initialized
    if (!datePicker || !timePicker) {
      return;
    }

    // open datepicker
    datePicker.open();
  }

  clearDate(): void {
    this.selectedDate.patchValue(null);
    this.selectedTime.patchValue(null);

    // notify parent that this control has been reset
    this.onChange(null);
  }

  writeValue(value: number | string | Date): void {
    if (!value) {
      return;
    }
    const formattedDate = new Date(value);
    this.selectedDate.patchValue(formattedDate, { emitEvent: false });
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: DatePickerComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: DatePickerComponent['onTouched']): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  private formatDate(date: Date | null): string | null {
    const type = this.type();

    if (!date) {
      return 'Please select a date';
    }

    if (type === 'date') {
      return this.datePipe.transform(date, 'dd. MMMM, YYYY');
    }

    return `${this.datePipe.transform(date, 'HH:mm dd. MMMM, YYYY')}`;
  }
}
