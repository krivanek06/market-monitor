import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DefaultImageType, InputSource, InputSourceWrapper } from '@mm/shared/data-access';
import { derivedFrom } from 'ngxtension/derived-from';
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
    MatButtonModule,
  ],
  template: `
    <mat-form-field appearance="fill">
      <!-- label -->
      <mat-label> {{ inputCaption() }}</mat-label>

      @switch (inputType()) {
        @case ('SELECT_SOURCE_WRAPPER') {
          <mat-select [disableRipple]="disabled()" [disabled]="disabled()" [value]="internalSelectValue()?.value">
            <mat-select-trigger class="flex items-center gap-2">
              <img
                appDefaultImg
                *ngIf="internalSelectValue()?.image as selectedOptionImage"
                [imageType]="displayImageType()"
                [src]="selectedOptionImage"
                alt="Option image"
                class="h-8 w-8"
              />
              {{ internalSelectValue()?.caption }}
            </mat-select-trigger>
            <mat-optgroup *ngFor="let source of inputSourceWrapper()" [label]="source.name">
              <!-- clear option -->
              <mat-option *ngIf="internalSelectValue() && showClearButton()" (click)="onClear()"> clear </mat-option>
              @for (optionData of source.items; track optionData.caption) {
                <mat-option [value]="optionData.value" (onSelectionChange)="onOptionChange($event)">
                  <div class="flex items-center gap-2">
                    <img
                      appDefaultImg
                      [imageType]="displayImageType()"
                      *ngIf="optionData?.image"
                      [src]="optionData.image"
                      class="h-8 w-8"
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
            <!-- clear button -->
            @if (internalSelectValue()) {
              <button class="w-full p-4" mat-button type="button" (click)="onClear()">clear</button>
            }
            @for (optionData of autoCompleteInputSource(); track optionData.caption) {
              <mat-option [value]="optionData.value" (onSelectionChange)="onOptionChange($event)">
                <div class="flex min-w-max items-center gap-2">
                  <img
                    appDefaultImg
                    *ngIf="optionData.image as selectedOptionImage"
                    [imageType]="displayImageType()"
                    [src]="selectedOptionImage"
                    alt="Option image"
                    class="h-8 w-8"
                  />
                  <span>{{ optionData.caption }}</span>
                </div>
              </mat-option>
            }
          </mat-autocomplete>
        }
        @case ('MULTISELECT') {
          <mat-select [disableRipple]="disabled()" multiple="true" [value]="multiselectOptionsValues()">
            <!-- clear button -->
            @if (internalSelectValue()) {
              <button class="w-full p-4" mat-button type="button" (click)="onClear()">clear</button>
            }
            @for (optionData of inputSource(); track optionData.caption) {
              <mat-option [value]="optionData.value" (onSelectionChange)="onOptionChange($event)">
                <div class="flex min-w-max items-center gap-2">
                  @if (optionData?.image; as image) {
                    <img appDefaultImg [imageType]="displayImageType()" [src]="image" class="h-8 w-8" />
                  }
                  {{ optionData.caption }}
                </div>
              </mat-option>
            }
          </mat-select>
        }
        @default {
          <mat-select [disableRipple]="disabled()" [value]="internalSelectValue()?.value">
            <mat-select-trigger *ngIf="internalSelectValue() as internalSelectValue" class="flex items-center gap-2">
              @if (internalSelectValue?.image; as image) {
                <img appDefaultImg [imageType]="displayImageType()" [src]="image" class="h-8 w-8" />
              }
              {{ internalSelectValue?.caption }}
            </mat-select-trigger>
            <!-- clear button -->
            @if (internalSelectValue() && showClearButton()) {
              <button class="w-full p-4" mat-button type="button" (click)="onClear()">clear</button>
            }
            @for (optionData of inputSource(); track optionData.caption) {
              <mat-option [value]="optionData.value" (onSelectionChange)="onOptionChange($event)">
                <div class="flex min-w-max items-center gap-2">
                  <img
                    *ngIf="optionData?.image"
                    appDefaultImg
                    [imageType]="displayImageType()"
                    [src]="optionData.image"
                    class="h-8 w-8"
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
  readonly inputCaption = input.required<string>();
  readonly displayImageType = input<DefaultImageType>('default');
  readonly inputType = input<'SELECT' | 'MULTISELECT' | 'SELECT_AUTOCOMPLETE' | 'SELECT_SOURCE_WRAPPER'>('SELECT');

  readonly showClearButton = input<boolean>(false);

  /**
   * data which are displayed in Select.option
   */
  readonly inputSource = input<InputSource<T>[] | null | undefined>([]);

  /**
   * user only when inputType ==== 'SELECT_SOURCE_WRAPPER
   */
  readonly inputSourceWrapper = input<InputSourceWrapper<T>[] | null | undefined>([]);

  /**
   * control for autocomplete for user to type input to filter values
   */
  readonly autoCompleteControl = new FormControl<string | null>('');

  /**
   * keep the last selected value by user to display custom caption and image in UI
   * inside mat-select-trigger
   */
  readonly internalSelectValue = signal<InputSource<T> | undefined | null>(undefined);

  /**
   * data which are displayed in MatOption for autocomplete
   */
  readonly autoCompleteInputSource = derivedFrom(
    [this.autoCompleteControl.valueChanges.pipe(startWith('')), this.inputSource],
    pipe(
      map(([value, inputSource]) =>
        inputSource?.filter((source) => source.caption.toLowerCase().startsWith(value?.toLowerCase() ?? '')),
      ),
    ),
    { initialValue: this.inputSource() ?? [] },
  );

  /**
   * track the selected values in multiselect
   */
  readonly multiselectOptions = signal<InputSource<T>[]>([]);
  readonly multiselectOptionsValues = computed(() => this.multiselectOptions().map((d) => d.value));

  readonly disabled = signal(false);

  constructor() {
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

  onChange: (value: T[] | T | undefined) => void = () => {};
  onTouched = () => {};

  writeValue(obj: T | T[] | undefined): void {
    const inputSource = [
      ...(this.inputSource() ?? []),
      ...(this.inputSourceWrapper()?.flatMap((wrapper) => wrapper.items) ?? []),
    ];

    // user cleared the value
    if (!obj) {
      this.autoCompleteControl.setValue(null);
      this.internalSelectValue.set(undefined);
      return;
    }

    // multiple data
    if (Array.isArray(obj) && this.inputType() === 'MULTISELECT') {
      const sources = obj.map((value) => inputSource.find((source) => source.value === value)).filter((d) => !!d);
      this.internalSelectValue.set(sources[0]);
      this.multiselectOptions.set(sources);
    }

    // single data
    if (!Array.isArray(obj) && this.inputType() !== 'MULTISELECT') {
      const source = inputSource.find((source) => source.value === obj) ?? null;
      this.internalSelectValue.set(source);
    }

    console.log('selectedValuesControl', obj);
  }

  onClear() {
    this.onChange(undefined);
    this.internalSelectValue.set(undefined);
    this.autoCompleteControl.setValue(null);
    this.multiselectOptions.set([]);
  }

  onOptionChange(event: MatOptionSelectionChange<T>) {
    //console.log('onOptionChange', event);
    if (!event.isUserInput) {
      return;
    }

    const inputSource = [
      ...(this.inputSource() ?? []),
      ...(this.inputSourceWrapper()?.flatMap((wrapper) => wrapper.items) ?? []),
    ];
    const source = inputSource.find((source) => source.value === event.source.value);

    // source not found
    if (!source) {
      return;
    }

    // display value on UI
    this.internalSelectValue.set(source);

    // check if multiselect
    if (this.inputType() === 'MULTISELECT') {
      if (event.source.selected) {
        this.multiselectOptions.set([...this.multiselectOptions(), source]);
      } else {
        const restOfData = this.multiselectOptions().filter((d) => d.value !== source.value);
        this.multiselectOptions.set(restOfData);
      }

      const valuesToEmit = this.multiselectOptions().map((d) => d.value);
      this.onChange(valuesToEmit);
      console.log('DropdownControlComponent emit', valuesToEmit);
      return;
    }

    // emit to parent
    this.onChange(source?.value);

    console.log('DropdownControlComponent emit', source?.value);
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
