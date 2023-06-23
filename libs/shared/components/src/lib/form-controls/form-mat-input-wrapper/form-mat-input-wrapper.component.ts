import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DefaultImgDirective } from '@market-monitor/shared-directives';
import { InputSource, InputSourceWrapper, InputType, InputTypeEnum } from '../form-controls.model';

@Component({
  selector: 'app-form-mat-input-wrapper',
  templateUrl: './form-mat-input-wrapper.component.html',
  styleUrls: ['./form-mat-input-wrapper.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    MatTooltipModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    FormsModule,
    MatSliderModule,
    MatButtonModule,
    DefaultImgDirective,
  ],
})
export class FormMatInputWrapperComponent<T> implements OnInit, ControlValueAccessor {
  @Input() controlName!: string;
  @Input() inputCaption!: string;
  @Input() prefixIcon?: string;
  @Input() inputType: InputTypeEnum | InputType = 'TEXT';

  /*
		disable input source
	  */
  @Input() disabled = false;

  /*
		display hint text for input
	  */
  @Input() hintText?: string;

  /**
   * data which are displayed in Select.option
   * use only if inputType === 'SELECT' | 'MULTISELECT' | 'SELECTSEARCH'
   */
  @Input() inputSource?: InputSource<T>[] | null = [];

  /**
   * user only when inputType ==== 'SELECT_SOURCE_WRAPPER
   */
  @Input() inputSourceWrapper?: InputSourceWrapper<T>[] | null = [];

  onChange: (value: T) => void = () => {};
  onTouched = () => {};

  InputType = InputTypeEnum;
  internalFormControl = new FormControl<T | null>(null);

  /**
   * keep the last selected value by user to display custom caption and image in UI
   */
  internalSelectFormControl = signal<InputSource<T> | null>(null);

  private parentFormControl!: FormControl;

  constructor(private controlContainer: ControlContainer) {}

  get usedFormControl(): FormControl {
    return this.parentFormControl;
  }

  get shouldBeErrorsShowed(): boolean | null {
    if (!this.usedFormControl) {
      return false;
    }

    return this.usedFormControl.errors && (this.usedFormControl.touched || this.usedFormControl.dirty);
  }

  ngOnInit(): void {
    this.parentFormControl = this.controlContainer.control?.get(this.controlName) as FormControl;
  }

  onSelectChange(inputSource: InputSource<T>, e: MatOptionSelectionChange) {
    // prevent double execution
    if (e.isUserInput) {
      this.internalSelectFormControl.set(inputSource);
    }
  }

  writeValue(obj: T): void {
    this.internalFormControl.patchValue(obj, { emitEvent: false });
  }
  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: FormMatInputWrapperComponent<T>['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: FormMatInputWrapperComponent<T>['onTouched']): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
