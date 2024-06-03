import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-mat-input-wrapper',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FormMatInputWrapperComponentMock,
      multi: true,
    },
  ],
})
export class FormMatInputWrapperComponentMock implements ControlValueAccessor {
  onChange: (value: any) => void = () => {};
  onTouched = () => {};
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
