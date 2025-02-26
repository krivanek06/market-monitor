import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LoginUserInput } from '@mm/authentication/data-access';

@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormLoginComponentMock),
      multi: true,
    },
  ],
})
export class FormLoginComponentMock implements ControlValueAccessor {
  onChange: (value: LoginUserInput) => void = () => {};
  onTouched = () => {};
  writeValue(obj: LoginUserInput): void {}

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: FormLoginComponentMock['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: FormLoginComponentMock['onTouched']): void {
    this.onTouched = fn;
  }
}
