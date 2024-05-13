import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DefaultImageType, InputSource, InputSourceWrapper } from '@mm/shared/data-access';
import { computedFrom } from 'ngxtension/computed-from';
import { filterNil } from 'ngxtension/filter-nil';
import { distinctUntilChanged, filter, map, pipe, startWith } from 'rxjs';
import { DefaultImgDirective } from '../../../directives';

@Component({
  selector: 'app-dropdown-control',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    DefaultImgDirective,
  ],
  template: `
    <mat-form-field appearance="fill">
      <!-- label -->
      <mat-label> {{ inputCaption() }}</mat-label>

      @switch (inputType()) {
        @case ('SELECT_SOURCE_WRAPPER') {
          <mat-select [disableRipple]="disabled()" [disabled]="disabled()" [formControl]="selectedValuesControl">
            <mat-select-trigger class="flex items-center gap-2">
              <img
                appDefaultImg
                *ngIf="internalSelectValue()?.image as selectedOptionImage"
                [imageType]="displayImageType()"
                [src]="selectedOptionImage"
                alt="Option image"
                class="w-8 h-8"
              />
              {{ internalSelectValue()?.caption }}
            </mat-select-trigger>
            <mat-optgroup *ngFor="let source of inputSourceWrapper()" [label]="source.name">
              <!-- clear option -->
              <mat-option *ngIf="internalSelectValue() && showClearButton()" (click)="onClear()"> clear </mat-option>
              @for (optionData of source.items; track optionData.caption) {
                <mat-option [value]="optionData.value">
                  <div class="flex items-center gap-2">
                    <img
                      appDefaultImg
                      [imageType]="displayImageType()"
                      *ngIf="optionData?.image"
                      [src]="optionData.image"
                      class="w-8 h-8"
                      alt=""
                    />
                    {{ optionData.caption }}
                  </div>
                </mat-option>
              }
            </mat-optgroup>
          </mat-select>
        }
        @case ('SELECT_AUTOCOMPLETE') {
          <input matInput type="text" [matAutocomplete]="auto" [formControl]="autoCompleteControl" />
          <mat-autocomplete #auto="matAutocomplete">
            <!-- clear option -->
            <mat-option *ngIf="internalSelectValue()" (click)="onClear()"> clear </mat-option>
            @for (optionData of autoCompleteInputSource(); track optionData.caption) {
              <mat-option [value]="optionData.value" (onSelectionChange)="selectedValuesControl.patchValue(optionData)">
                <div class="flex items-center gap-2 min-w-max">
                  <img
                    appDefaultImg
                    *ngIf="optionData.image as selectedOptionImage"
                    [imageType]="displayImageType()"
                    [src]="selectedOptionImage"
                    alt="Option image"
                    class="w-8 h-8"
                  />
                  <span>{{ optionData.caption }}</span>
                </div>
              </mat-option>
            }
          </mat-autocomplete>
        }
        @case ('MULTISELECT') {
          <mat-select [disableRipple]="disabled()" [formControl]="selectedValuesControl" multiple="true">
            <input class="select-input" placeholder="Search" tabindex="0" />
            <!-- clear option -->
            <mat-option *ngIf="internalSelectValue" (click)="onClear()"> clear </mat-option>
            @for (optionData of inputSource(); track optionData.caption) {
              <mat-option [value]="optionData.value">
                <div class="flex items-center gap-2 min-w-max">
                  <img
                    *ngIf="optionData?.image"
                    appDefaultImg
                    [imageType]="displayImageType()"
                    [src]="optionData.image"
                    class="w-8 h-8"
                    alt=""
                  />
                  {{ optionData.caption }}
                </div>
              </mat-option>
            }
          </mat-select>
        }
        @default {
          <mat-select [disableRipple]="disabled()" [formControl]="selectedValuesControl">
            <mat-select-trigger *ngIf="internalSelectValue() as internalSelectValue" class="flex items-center gap-2">
              <img
                appDefaultImg
                *ngIf="internalSelectValue?.image as selectedOptionImage"
                [imageType]="displayImageType()"
                [src]="selectedOptionImage"
                alt="Option image"
                class="w-8 h-8"
              />
              {{ internalSelectValue?.caption }}
            </mat-select-trigger>
            <!-- clear option -->
            <mat-option *ngIf="internalSelectValue() && showClearButton()" (click)="onClear()"> clear </mat-option>
            @for (optionData of inputSource(); track optionData.caption) {
              <mat-option [value]="optionData">
                <div class="flex items-center gap-2 min-w-max">
                  <img
                    *ngIf="optionData?.image"
                    appDefaultImg
                    [imageType]="displayImageType()"
                    [src]="optionData.image"
                    class="w-8 h-8"
                    alt=""
                  />
                  {{ optionData.caption }}
                </div>
              </mat-option>
            }
          </mat-select>
        }
      }
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }

    mat-form-field.mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field-infix {
      height: 60px !important;
    }

    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      height: 0px !important;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownControlComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownControlComponent<T> implements ControlValueAccessor {
  inputCaption = input.required<string>();
  displayImageType = input<DefaultImageType>('default');
  inputType = input<'SELECT' | 'MULTISELECT' | 'SELECT_AUTOCOMPLETE' | 'SELECT_SOURCE_WRAPPER'>('SELECT');

  showClearButton = input<boolean>(false);

  /**
   * data which are displayed in Select.option
   */
  inputSource = input<InputSource<T>[] | null | undefined>([]);

  /**
   * user only when inputType ==== 'SELECT_SOURCE_WRAPPER
   */
  inputSourceWrapper = input<InputSourceWrapper<T>[] | null | undefined>([]);

  /**
   * keep track of all selected values
   */
  selectedValuesControl = new FormControl<InputSource<T>[] | InputSource<T> | null>(null);

  /**
   * control for autocomplete for user to type input to filter values
   */
  autoCompleteControl = new FormControl<string | null>('');

  /**
   * keep the last selected value by user to display custom caption and image in UI
   * inside mat-select-trigger
   */
  internalSelectValue = toSignal(
    this.selectedValuesControl.valueChanges.pipe(
      map((value) => (Array.isArray(value) ? value[value.length - 1] : value)),
    ),
  );

  /**
   * data which are displayed in MatOption for autocomplete
   */
  autoCompleteInputSource = computedFrom(
    [this.autoCompleteControl.valueChanges.pipe(startWith('')), this.inputSource],
    pipe(
      map(([value, inputSource]) =>
        inputSource?.filter((source) => source.caption.toLowerCase().startsWith(value?.toLowerCase() ?? '')),
      ),
    ),
    { initialValue: this.inputSource() ?? [] },
  );

  disabled = signal(false);

  constructor() {
    this.selectedValuesControl.valueChanges.pipe(filterNil(), takeUntilDestroyed()).subscribe((values) => {
      const workingVal = this.selectedValuesControl.value;
      const emitVal = !workingVal
        ? null
        : Array.isArray(workingVal)
          ? workingVal.map((v) => v.value)
          : workingVal.value;
      console.log('DropdownControlComponent emit', emitVal);

      this.onChange(emitVal);
    });

    // listen to autocomplete value changes - when empty emit
    this.autoCompleteControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((d) => !d && !!this.internalSelectValue()),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.onClear();
      });
  }

  onChange: (value: T[] | T | null) => void = () => {};
  onTouched = () => {};

  writeValue(obj: T | T[] | undefined): void {
    const inputSource = [
      ...(this.inputSource() ?? []),
      ...(this.inputSourceWrapper()?.flatMap((wrapper) => wrapper.items) ?? []),
    ];

    if (!obj) {
      this.selectedValuesControl.setValue(null);
      this.autoCompleteControl.setValue(null);
      return;
    }

    // multiple data
    if (Array.isArray(obj) && this.inputType() === 'MULTISELECT') {
      const sources = obj
        .map((value) => inputSource.find((source) => source.value === value))
        .filter((d): d is InputSource<T> => !!d);
      this.selectedValuesControl.patchValue(sources, { emitEvent: false });
    }

    // single data
    if (!Array.isArray(obj) && this.inputType() !== 'MULTISELECT') {
      const source = inputSource.find((source) => source.value === obj) ?? null;
      this.selectedValuesControl.patchValue(source, { emitEvent: false });
    }

    console.log('selectedValuesControl', obj, this.selectedValuesControl.value);
  }

  onClear() {
    this.selectedValuesControl.setValue(null);
    this.onChange(null);
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: DropdownControlComponent<T>['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: DropdownControlComponent<T>['onTouched']): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
