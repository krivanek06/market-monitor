import { DateFilterFn } from '@angular/material/datepicker';

export interface InputTypeDateTimePickerConfig {
  minDate?: Date | string;
  maxDate?: Date | string;
  dateFilter?: DateFilterFn<any>;
}
