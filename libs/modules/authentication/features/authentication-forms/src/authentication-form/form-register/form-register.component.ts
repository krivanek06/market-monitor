import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RegisterUserInput } from '@market-monitor/modules/authentication/data-access';
import {
  emailValidator,
  maxLengthValidator,
  minLengthValidator,
  requiredValidator,
} from '@market-monitor/shared/data-access';
import { DialogServiceUtil } from '@market-monitor/shared/features/dialog-manager';
import { FormMatInputWrapperComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-form-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormMatInputWrapperComponent, MatButtonModule],
  template: `
    <form [formGroup]="formGroup" class="flex flex-col gap-4" (ngSubmit)="onSubmit()">
      <!-- email -->
      <app-form-mat-input-wrapper
        formControlName="email"
        inputCaption="Email"
        inputType="EMAIL"
      ></app-form-mat-input-wrapper>

      <!-- password1 -->
      <app-form-mat-input-wrapper
        formControlName="password1"
        inputCaption="Password"
        inputType="PASSWORD"
      ></app-form-mat-input-wrapper>

      <!-- password2 -->
      <app-form-mat-input-wrapper
        formControlName="password2"
        inputCaption="Password"
        inputType="PASSWORD"
      ></app-form-mat-input-wrapper>

      <!-- submit -->
      <button mat-stroked-button class="w-full" color="primary" type="submit">Register</button>
    </form>
  `,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormRegisterComponent),
      multi: true,
    },
  ],
})
export class FormRegisterComponent implements ControlValueAccessor {
  formGroup = new FormGroup({
    email: new FormControl('', {
      validators: [emailValidator, requiredValidator, maxLengthValidator(100)],
      nonNullable: true,
    }),
    password1: new FormControl('', {
      validators: [requiredValidator, maxLengthValidator(25), minLengthValidator(4)],
      nonNullable: true,
    }),
    password2: new FormControl('', {
      validators: [requiredValidator, maxLengthValidator(25), minLengthValidator(4)],
      nonNullable: true,
    }),
  });

  dialogServiceUtil = inject(DialogServiceUtil);

  onChange: (value: RegisterUserInput) => void = () => {};
  onTouched = () => {};

  constructor() {}

  onSubmit(): void {
    if (this.formGroup.invalid) {
      return;
    }
    const controls = this.formGroup.controls;

    // passwords don't match
    if (controls.password1.value !== controls.password2.value) {
      controls.password1.patchValue('');
      controls.password2.patchValue('');
      controls.password1.updateValueAndValidity();
      controls.password2.updateValueAndValidity();
      this.dialogServiceUtil.showNotificationBar('Passwords do not match!', 'error');
      return;
    }

    const result: RegisterUserInput = {
      email: controls.email.value,
      password: controls.password1.value,
      passwordRepeat: controls.password2.value,
    };

    this.onChange(result);
  }

  writeValue(obj: RegisterUserInput): void {}

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: FormRegisterComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: FormRegisterComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
