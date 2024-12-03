import { ChangeDetectionStrategy, Component, forwardRef, inject } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RegisterUserInput } from '@mm/authentication/data-access';
import { emailValidator, maxLengthValidator, minLengthValidator, requiredValidator } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { FormMatInputWrapperComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-form-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormMatInputWrapperComponent, MatButtonModule],
  template: `
    <form [formGroup]="formGroup" class="flex flex-col gap-4" (ngSubmit)="onSubmit()">
      <!-- email -->
      <app-form-mat-input-wrapper [formControl]="formGroup.controls.email" inputCaption="Email" inputType="EMAIL" />

      <!-- password1 -->
      <app-form-mat-input-wrapper
        [formControl]="formGroup.controls.password1"
        inputCaption="Password"
        inputType="PASSWORD"
      />

      <!-- password2 -->
      <app-form-mat-input-wrapper
        [formControl]="formGroup.controls.password2"
        inputCaption="Password"
        inputType="PASSWORD"
      />

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
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormRegisterComponent),
      multi: true,
    },
  ],
})
export class FormRegisterComponent implements ControlValueAccessor {
  private readonly dialogServiceUtil = inject(DialogServiceUtil);

  readonly formGroup = new FormGroup({
    email: new FormControl('', {
      validators: [emailValidator, requiredValidator, maxLengthValidator(30)],
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

  onChange: (value: RegisterUserInput) => void = () => {};
  onTouched = () => {};

  onSubmit(): void {
    // mark all controls as touched
    this.formGroup.markAllAsTouched();

    // form is invalid
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

  validate(control: AbstractControl): ValidationErrors | null {
    return this.formGroup.errors;
  }

  registerOnValidatorChange?(fn: () => void): void {
    //throw new Error('Method not implemented.');
  }
}
