import { KeyValuePipe, LowerCasePipe, NgClass } from '@angular/common';
import { Component, Injector, OnInit, forwardRef, inject, input, signal } from '@angular/core';
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
import { DefaultImgDirective } from '../../../directives';

@Component({
  selector: 'app-form-mat-input-wrapper',
  template: `
    <mat-form-field
      appearance="fill"
      [hintLabel]="showErrors ? '' : hintText()"
      [ngClass]="{ 'g-form-error': showErrors }"
    >
      <!-- label -->
      <mat-label> {{ inputCaption() }}</mat-label>

      <!-- text, number,  email -->
      <input
        [formControl]="internalFormControl"
        [readOnly]="disabled()"
        [type]="inputType() | lowercase"
        autocomplete="off"
        matInput
      />

      <!-- prefix icon -->
      @if (prefixIcon()) {
        <mat-icon matPrefix class="icon-prefix">{{ prefixIcon() }}</mat-icon>
      }
    </mat-form-field>

    <!-- errors -->
    @if (showErrors) {
      @for (inputError of parentControl?.errors | keyvalue; track $index; let i = $index) {
        <!-- show only first error -->
        <div class="text-wt-danger -mt-5 text-xs">
          {{ inputError.value.errorText }}
        </div>
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
    mat-form-field {
      width: 100%;
    }
  `,
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormMatInputWrapperComponent<T extends string | number | null> implements OnInit, ControlValueAccessor {
  private readonly injector = inject(Injector, {
    optional: true,
    host: true,
  });

  readonly inputCaption = input.required<string>();
  readonly prefixIcon = input<string | undefined>();
  readonly inputType = input<'TEXT' | 'NUMBER' | 'PASSWORD' | 'EMAIL' | 'TEXTAREA'>('TEXT');

  /**
   * disable input source
   */
  readonly disabled = signal(false);

  /**
   * display hint text for input
   */
  readonly hintText = input<string>('');

  onChange: (value: T) => void = () => {
    /** */
  };
  onTouched = () => {
    /** */
  };
  readonly internalFormControl = new FormControl<T | null>(null);

  // TODO: remove this if possible to get parent validators
  parentControl?: FormControl;

  get showErrors(): boolean {
    return this.parentControl ? this.parentControl.touched && this.parentControl.invalid : false;
  }

  ngOnInit(): void {
    const controlName = this.injector?.get(NgControl) as FormControlName;
    // access parent form control
    if (controlName) {
      this.parentControl = controlName.control;
      //console.log('parentControl', this.parentControl);
    }

    this.internalFormControl.valueChanges.subscribe((value) => {
      const castValue = (this.inputType() === 'NUMBER' ? Number(value) : value) as T;
      this.onChange(castValue);
      this.onTouched();
    });
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    if (this.parentControl) {
      return this.parentControl.errors;
    }

    return control?.errors ?? null;
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
    if (isDisabled) {
      this.internalFormControl.disable();
    } else {
      this.internalFormControl.enable();
    }
  }
}
