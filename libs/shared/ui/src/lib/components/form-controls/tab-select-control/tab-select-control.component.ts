import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { LabelValue, SCREEN_LAYOUT, screenLayoutResolveType } from '@mm/shared/data-access';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-tab-select-control',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatSelectModule],
  template: `
    <!-- tabs -->
    <div class="md:flex md:justify-end">
      <mat-tab-group
        *ngIf="showTabsSignal(); else showSelect"
        [selectedIndex]="selectedValueSignal()?.index"
        (selectedTabChange)="onSelectTabChange($event)"
      >
        <mat-tab *ngFor="let option of displayOptions()" [label]="option.label"></mat-tab>
      </mat-tab-group>
    </div>

    <!-- select -->
    <ng-template #showSelect>
      <mat-form-field class="w-full">
        <mat-label>Options</mat-label>
        <mat-select [value]="selectedValueSignal()?.value" (selectionChange)="onSelectChange($event)">
          <mat-option *ngFor="let option of displayOptions()" [value]="option.value">{{ option.label }}</mat-option>
        </mat-select>
      </mat-form-field>
    </ng-template>
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
  displayOptions = input.required<LabelValue<T>[]>();
  onChange: (data: T) => void = () => {};
  onTouched = () => {};

  selectedValueSignal = signal<{ value: T; index: number } | null>(null);

  screenLayoutSplit = input(SCREEN_LAYOUT.LAYOUT_SM, { transform: screenLayoutResolveType });
  private observer = inject(BreakpointObserver);

  /**
   * value true if screen is larger than provided screenLayoutSplit
   *
   * wasn't working correctly, when screenLayoutSplit was changed
   */
  showTabsSignal = toSignal(
    toObservable(this.screenLayoutSplit).pipe(
      switchMap((val) => this.observer.observe(val).pipe(map((d) => d.matches))),
    ),
  );

  onSelectTabChange(event: MatTabChangeEvent): void {
    const item = this.displayOptions()[event.index];

    if (!item) {
      return;
    }

    this.selectedValueSignal.set({
      index: event.index,
      value: item.value,
    });

    // notify parent
    this.onChange(item.value);
  }

  onSelectChange(event: MatSelectChange): void {
    const selectedValue = event.value as T;
    const index = this.displayOptions().findIndex((d) => d.value === selectedValue);

    this.selectedValueSignal.set({
      index: index,
      value: selectedValue,
    });

    // notify parent
    this.onChange(selectedValue);
  }

  writeValue(value: T): void {
    const index = this.displayOptions().findIndex((d) => d.value === value);
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
