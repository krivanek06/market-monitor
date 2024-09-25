import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, model } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { LabelValue, SCREEN_LAYOUT, screenLayoutResolveType } from '@mm/shared/data-access';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-tab-select-control',
  standalone: true,
  imports: [MatTabsModule, MatSelectModule],
  template: `
    <!-- tabs -->
    <div class="md:flex md:justify-end">
      @if (showTabsSignal()) {
        <mat-tab-group [selectedIndex]="selectedIndex()" (selectedTabChange)="onSelectTabChange($event)">
          @for (option of displayOptions(); track option.label) {
            <mat-tab [label]="option.label"></mat-tab>
          }
        </mat-tab-group>
      } @else {
        <!-- select -->
        <mat-form-field class="w-full">
          <mat-label>Options</mat-label>
          <mat-select [value]="selectedValueSignal()" (selectionChange)="onSelectChange($event)">
            @for (option of displayOptions(); track option.label) {
              <mat-option [value]="option.value">{{ option.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
    </div>
  `,
  styles: `
    ::ng-deep .mat-mdc-tab-group.mat-mdc-tab-group-stretch-tabs > .mat-mdc-tab-header .mat-mdc-tab {
      padding-left: 60px !important;
      padding-right: 60px !important;
    }

    ::ng-deep .mat-mdc-tab-list {
      margin-bottom: 8px !important;
    }
  `,
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
  readonly displayOptions = input.required<LabelValue<T>[]>();
  readonly selectedValueSignal = model<T | null | undefined>(null);
  readonly selectedIndex = computed(
    () => this.displayOptions().findIndex((d) => d.value === this.selectedValueSignal()) ?? 0,
  );

  readonly screenLayoutSplit = input(SCREEN_LAYOUT.LAYOUT_SM, { transform: screenLayoutResolveType });
  private readonly observer = inject(BreakpointObserver);

  /**
   * value true if screen is larger than provided screenLayoutSplit
   *
   * wasn't working correctly, when screenLayoutSplit was changed
   */
  readonly showTabsSignal = toSignal(
    toObservable(this.screenLayoutSplit).pipe(
      switchMap((val) => this.observer.observe(val).pipe(map((d) => d.matches))),
    ),
  );

  onChange: (data: T) => void = () => {};
  onTouched = () => {};

  onSelectTabChange(event: MatTabChangeEvent): void {
    const item = this.displayOptions()[event.index];

    if (!item) {
      return;
    }

    this.selectedValueSignal.set(item.value);

    // notify parent
    this.onChange(item.value);
  }

  onSelectChange(event: MatSelectChange): void {
    const selectedValue = event.value as T;

    this.selectedValueSignal.set(selectedValue);

    // notify parent
    this.onChange(selectedValue);
  }

  writeValue(value: T | undefined): void {
    this.selectedValueSignal.set(value);
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
