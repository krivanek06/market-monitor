import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { LoginUserInput } from '@mm/authentication/data-access';
import { FormMatInputWrapperComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormMatInputWrapperComponent, MatButtonModule],
  template: `
    <form [formGroup]="formGroup" class="flex flex-col gap-6" (ngSubmit)="onSubmit()">
      <!-- email -->
      <app-form-mat-input-wrapper [formControl]="formGroup.controls.email" inputCaption="Email" inputType="EMAIL" />

      <!-- password -->
      <app-form-mat-input-wrapper
        [formControl]="formGroup.controls.password"
        inputCaption="Password"
        inputType="PASSWORD"
      />

      <!-- submit -->
      <button mat-stroked-button color="primary" class="w-full" type="submit">Login</button>
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
      useExisting: forwardRef(() => FormLoginComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormLoginComponent),
      multi: true,
    },
  ],
})
export class FormLoginComponent implements ControlValueAccessor, Validator {
  readonly formGroup = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
    }),
    password: new FormControl('', {
      nonNullable: true,
    }),
  });

  onChange: (value: LoginUserInput) => void = () => {
    /** */
  };
  onTouched = () => {
    /** */
  };

  onSubmit(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const email = this.formGroup.controls.email.value;
    const password = this.formGroup.controls.password.value;

    // check if empty
    if (!email || !password) {
      return;
    }

    this.onChange({
      email,
      password,
    });
  }

  writeValue(obj: LoginUserInput): void {
    //this.formGroup.setValue(obj);
  }

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

  validate(control: AbstractControl): ValidationErrors | null {
    return this.formGroup.errors;
  }

  registerOnValidatorChange?(fn: () => void): void {
    //throw new Error('Method not implemented.');
  }
}
