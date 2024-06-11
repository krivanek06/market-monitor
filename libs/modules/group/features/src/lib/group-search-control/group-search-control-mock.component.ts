import { Component, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { GroupData } from '@mm/api-types';

@Component({
  selector: 'app-group-search-control',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: GroupSearchControlComponentMock,
      multi: true,
    },
  ],
})
export class GroupSearchControlComponentMock implements ControlValueAccessor {
  selectedEmitter = output<GroupData>();
  onChange: (value: GroupData) => void = () => {};
  onTouched = () => {};
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
