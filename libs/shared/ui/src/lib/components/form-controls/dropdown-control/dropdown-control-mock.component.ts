import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DefaultImageType, InputSource, InputSourceWrapper } from '@mm/shared/data-access';

@Component({
  selector: 'app-dropdown-control',
  standalone: true,
  imports: [],
  template: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownControlComponentMock),
      multi: true,
    },
  ],
})
export class DropdownControlComponentMock<T> implements ControlValueAccessor {
  inputCaption = input<string>();
  displayImageType = input<DefaultImageType>('default');
  inputType = input<'SELECT' | 'MULTISELECT' | 'SELECT_AUTOCOMPLETE' | 'SELECT_SOURCE_WRAPPER'>('SELECT');
  showClearButton = input<boolean>(false);
  inputSource = input<InputSource<T>[] | null | undefined>([]);
  inputSourceWrapper = input<InputSourceWrapper<T>[] | null | undefined>([]);

  onChange: (value: T[] | T | undefined) => void = () => {};
  onTouched = () => {};

  writeValue(obj: T | T[] | undefined): void {}
  registerOnChange(fn: DropdownControlComponentMock<T>['onChange']): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: DropdownControlComponentMock<T>['onTouched']): void {
    this.onTouched = fn;
  }
}
