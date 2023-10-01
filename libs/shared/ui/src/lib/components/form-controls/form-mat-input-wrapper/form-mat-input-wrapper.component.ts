import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Host,
  HostListener,
  Inject,
  Injector,
  Input,
  OnInit,
  Optional,
  forwardRef,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormControlName,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
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
import { InputSource, InputSourceWrapper, InputType, InputTypeEnum } from '@market-monitor/shared/data-access';
import { DefaultImgDirective } from '../../../directives';

@Component({
  selector: 'app-form-mat-input-wrapper',
  templateUrl: './form-mat-input-wrapper.component.html',
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormMatInputWrapperComponent),
      multi: true,
    },
  ],
  styles: [
    `
      mat-form-field.mat-mdc-form-field {
        width: 100%;
      }

      fieldset {
        clear: both;
      }

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none !important;
      }
    `,
  ],
})
export class FormMatInputWrapperComponent<T> implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input({ required: true }) inputCaption!: string;
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

  onChange: (value: T | null) => void = () => {};
  onTouched = () => {};

  InputType = InputTypeEnum;
  internalFormControl = new FormControl<T | null>(null);

  /**
   * keep the last selected value by user to display custom caption and image in UI
   */
  internalSelectFormControl = signal<InputSource<T> | null>(null);

  // TODO: remove this if possible to get parent validators
  parentFormControl?: FormControl;

  constructor(@Inject(Injector) @Optional() @Host() private injector: Injector) {}

  get showErrors(): boolean {
    return this.parentFormControl ? this.parentFormControl.touched && this.parentFormControl.invalid : false;
  }

  // todo: refactor this to react when mouse enters and leaves the component
  @HostListener('mouseup', ['$event'])
  onTouch() {
    console.log('touch');
    // notify parent form control that this control has been touched
    this.onTouched();
  }

  ngOnInit(): void {
    this.internalFormControl.valueChanges.subscribe((value) => {
      this.onChange(value);
    });
  }

  ngAfterViewInit(): void {
    const controlName = this.injector.get(NgControl) as FormControlName;

    // access parent form control
    if (controlName) {
      this.parentFormControl = controlName.control;
    }
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    if (!this.parentFormControl) {
      return null;
    }
    return this.parentFormControl.errors;
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
