import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, input, OnInit } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { DateFilterFn, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { filter } from 'rxjs';

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
  ],
  template: `
    <mat-form-field class="h-0 scale-0">
      <div class="hidden">
        <input
          [min]="inputTypeDateTimePickerConfig()?.minDate"
          [max]="inputTypeDateTimePickerConfig()?.maxDate"
          matInput
          [matDatepicker]="datePicker"
          [matDatepickerFilter]="inputTypeDateTimePickerConfig()?.dateFilter ?? defaultDateFilter"
          [formControl]="selectedDate"
        />
        <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
        <mat-datepicker #datePicker></mat-datepicker>
      </div>
    </mat-form-field>

    <div class="mb-5">
      <button
        [disabled]="isDisabled()"
        (click)="datePicker.open()"
        type="button"
        mat-stroked-button
        class="w-full min-h-[50px]"
      >
        {{ selectedDate.value ? 'Date: ' + (selectedDate.value | date: 'dd.MM.YYYY') : 'Please select a date' }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      ::ng-deep mat-datepicker-content {
        margin-top: 45px !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements OnInit {
  /*
		used when inputType === DATEPICKER
	*/
  inputTypeDateTimePickerConfig = input<InputTypeDateTimePickerConfig | undefined>();
  isDisabled = input(false);

  defaultDateFilter: DateFilterFn<any> = (d: Date) => true;

  onChange: (data: Date) => void = () => {};
  onTouched = () => {};

  selectedDate = new FormControl<Date | null>(null);

  ngOnInit(): void {
    this.selectedDate.valueChanges
      .pipe(filter((value): value is Date => !!value))
      .subscribe((res) => this.onChange(res));
  }

  writeValue(value: number | string | Date): void {
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
}
