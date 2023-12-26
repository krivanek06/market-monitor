import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { LoginUserInput } from '@market-monitor/modules/authentication/data-access';
import { FormMatInputWrapperComponent } from '@market-monitor/shared/ui';
import {
  emailValidator,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormMatInputWrapperComponent, MatButtonModule],
  templateUrl: './form-login.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormLoginComponent),
      multi: true,
    },
  ],
})
export class FormLoginComponent implements ControlValueAccessor {
  formGroup = new FormGroup({
    email: new FormControl('', {
      validators: [emailValidator, requiredValidator, maxLengthValidator(40)],
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: [requiredValidator, maxLengthValidator(25), minLengthValidator(6)],
      nonNullable: true,
    }),
  });

  onChange: (value: LoginUserInput) => void = () => {};
  onTouched = () => {};

  constructor() {}

  onSubmit(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const result: LoginUserInput = {
      email: this.formGroup.controls.email.value,
      password: this.formGroup.controls.password.value,
    };

    this.onChange(result);
  }

  writeValue(obj: LoginUserInput): void {}

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: FormLoginComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: FormLoginComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
