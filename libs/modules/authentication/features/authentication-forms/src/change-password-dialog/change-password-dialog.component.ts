import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationAccountService } from '@mm/authentication/data-access';
import { maxLengthValidator, minLengthValidator, requiredValidator } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { DialogCloseHeaderComponent, FormMatInputWrapperComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormMatInputWrapperComponent,
    DialogCloseHeaderComponent,
  ],
  template: `
    <app-dialog-close-header title="Change Password" />
    <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="flex flex-col gap-4 p-4 md:p-10 md:mb-6">
        <!-- old password -->
        <app-form-mat-input-wrapper
          formControlName="oldPassword"
          inputCaption="Old Password"
          inputType="PASSWORD"
        ></app-form-mat-input-wrapper>

        <!-- password1 -->
        <app-form-mat-input-wrapper
          formControlName="newPassword1"
          inputCaption="New Password"
          inputType="PASSWORD"
        ></app-form-mat-input-wrapper>

        <!-- password2 -->
        <app-form-mat-input-wrapper
          formControlName="newPassword2"
          inputCaption="New Password Confirm"
          inputType="PASSWORD"
        ></app-form-mat-input-wrapper>
      </mat-dialog-content>

      <mat-dialog-actions>
        <div class="g-mat-dialog-actions-full">
          <button type="button" mat-flat-button mat-dialog-close>Cancel</button>
          <button type="submit" mat-flat-button color="primary">Save</button>
        </div>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordDialogComponent {
  private dialogServiceUtil = inject(DialogServiceUtil);
  private authenticationAccountService = inject(AuthenticationAccountService);
  private dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(4), maxLengthValidator(20)],
      nonNullable: true,
    }),
    newPassword1: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(6), maxLengthValidator(20)],
      nonNullable: true,
    }),
    newPassword2: new FormControl('', {
      validators: [requiredValidator, minLengthValidator(6), maxLengthValidator(20)],
      nonNullable: true,
    }),
  });

  async onSubmit(): Promise<void> {
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill in all fields', 'error');
      return;
    }

    const controls = this.passwordForm.controls;

    // passwords don't match
    if (controls.newPassword1.value !== controls.newPassword2.value) {
      controls.newPassword1.patchValue('');
      controls.newPassword2.patchValue('');
      controls.newPassword1.updateValueAndValidity();
      controls.newPassword2.updateValueAndValidity();
      this.dialogServiceUtil.showNotificationBar('Passwords do not match!', 'error');
      return;
    }

    // change password
    try {
      await this.authenticationAccountService.changePassword(controls.oldPassword.value, controls.newPassword1.value);
      this.dialogServiceUtil.showNotificationBar('Password changed successfully! Try to logout', 'success');
      this.dialogRef.close();
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
      return;
    }
  }
}
