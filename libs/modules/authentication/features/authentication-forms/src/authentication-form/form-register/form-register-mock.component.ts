import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { RegisterUserInput } from '@mm/authentication/data-access';

@Component({
  selector: 'app-form-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormRegisterMockComponent),
      multi: true,
    },
  ],
})
export class FormRegisterMockComponent implements ControlValueAccessor {
  onChange: (value: RegisterUserInput) => void = () => {};
  onTouched = () => {};

  writeValue(obj: RegisterUserInput): void {}

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: FormRegisterMockComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: FormRegisterMockComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
