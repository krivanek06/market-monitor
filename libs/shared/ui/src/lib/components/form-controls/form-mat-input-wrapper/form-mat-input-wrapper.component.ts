import { KeyValuePipe, LowerCasePipe, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Host,
  HostListener,
  Inject,
  Injector,
  OnInit,
  Optional,
  forwardRef,
  input,
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DefaultImageType } from '@mm/shared/data-access';
import { DefaultImgDirective } from '../../../directives';

@Component({
  selector: 'app-form-mat-input-wrapper',
  template: `
    <fieldset [disabled]="disabled()">
      <mat-form-field
        appearance="fill"
        [ngClass]="{ 'g-form-error': parentFormControl?.touched && parentFormControl?.invalid }"
      >
        <!-- label -->
        <mat-label> {{ inputCaption() }}</mat-label>

        <!-- text, number, time, email -->
        <input
          [formControl]="internalFormControl"
          [readOnly]="disabled()"
          [type]="inputType() | lowercase"
          autocomplete="off"
          matInput
        />

        <!-- hint -->
        @if (hintText()) {
          <mat-hint class="text-wt-gray-medium hidden sm:block" matSuffix>
            {{ hintText() }}
          </mat-hint>
        }

        <!-- prefix icon -->
        @if (prefixIcon()) {
          <mat-icon matPrefix class="icon-prefix">{{ prefixIcon() }}</mat-icon>
        }
      </mat-form-field>
    </fieldset>

    <!-- errors -->
    @if (showErrors) {
      @for (inputError of parentFormControl?.errors | keyvalue; track $index) {
        <mat-error [id]="''">
          {{ inputError.value.errorText }}
        </mat-error>
      }
    }
  `,
  standalone: true,
  imports: [
    KeyValuePipe,
    LowerCasePipe,
    NgClass,
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
  styles: `
    mat-form-field.mat-mdc-form-field {
      width: 100%;
      height: 52px;
    }

    fieldset {
      clear: both;
    }

    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none !important;
    }
  `,
})
export class FormMatInputWrapperComponent<T> implements OnInit, AfterViewInit, ControlValueAccessor {
  readonly inputCaption = input.required<string>();
  readonly prefixIcon = input<string | undefined>();
  readonly inputType = input<'TEXT' | 'NUMBER' | 'PASSWORD' | 'EMAIL' | 'TEXTAREA'>('TEXT');
  readonly displayImageType = input<DefaultImageType>('default');

  /*
		disable input source
	  */
  readonly disabled = signal(false);

  /*
		display hint text for input
	  */
  readonly hintText = input<string | undefined>();

  onChange: (value: T | null) => void = () => {
    /** */
  };
  onTouched = () => {
    /** */
  };
  readonly internalFormControl = new FormControl<T | null>(null);

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

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
