import { Component, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { UserData } from '@mm/api-types';

@Component({
  selector: 'app-user-search-control',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UserSearchControlComponentMock,
      multi: true,
    },
  ],
})
export class UserSearchControlComponentMock implements ControlValueAccessor {
  selectedUserEmitter = output<UserData>();
  onChange: (value: UserData) => void = () => {};
  onTouched = () => {};
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
