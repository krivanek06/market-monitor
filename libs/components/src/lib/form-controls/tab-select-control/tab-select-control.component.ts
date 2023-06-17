import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { LabelValue, SCREEN_LAYOUT } from '@market-monitor/shared-types';
import { map } from 'rxjs';

@Component({
  selector: 'app-tab-select-control',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatSelectModule],
  templateUrl: './tab-select-control.component.html',
  styleUrls: ['./tab-select-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TabSelectControlComponent),
      multi: true,
    },
  ],
})
export class TabSelectControlComponent<T> implements ControlValueAccessor {
  @Input({ required: true }) displayOptions: LabelValue<T>[] = [];
  @Input() screenLayoutSplit: SCREEN_LAYOUT = SCREEN_LAYOUT.LAYOUT_SM;

  onChange: (data: T) => void = () => {};
  onTouched = () => {};

  selectedValueSignal = signal<{ value: T; index: number } | null>(null);

  /**
   * value true if screen is larger than provided screenLayoutSplit
   */
  observedChange$ = inject(BreakpointObserver)
    .observe(this.screenLayoutSplit)
    .pipe(map((d) => d.matches));

  onSelectTabChange(event: MatTabChangeEvent): void {
    const item = this.displayOptions[event.index];
    this.selectedValueSignal.set({
      index: event.index,
      value: item.value,
    });

    // notify parent
    this.onChange(item.value);
  }

  onSelectChange(event: MatSelectChange): void {
    const selectedValue = event.value as T;
    const index = this.displayOptions.findIndex((d) => d.value === selectedValue);

    this.selectedValueSignal.set({
      index: index,
      value: selectedValue,
    });

    // notify parent
    this.onChange(selectedValue);
  }

  writeValue(value: T): void {
    const index = this.displayOptions.findIndex((d) => d.value === value);
    this.selectedValueSignal.set({
      index,
      value,
    });
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: TabSelectControlComponent<T>['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: TabSelectControlComponent<T>['onTouched']): void {
    this.onTouched = fn;
  }
}
