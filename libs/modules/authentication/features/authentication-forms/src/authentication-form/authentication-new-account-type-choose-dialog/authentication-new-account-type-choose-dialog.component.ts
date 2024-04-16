import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserAccountBasicTypes, UserAccountEnum, accountDescription } from '@mm/api-types';

@Component({
  selector: 'app-authentication-new-account-type-choose-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <mat-dialog-content>
      <div class="max-w-[750px]">
        <!-- description -->
        <div class="text-center mb-4 p-3">
          When creating an account you can choose either a demo trading account or a basic account. You can also change
          it in the settings.
        </div>

        <!-- selected account -->
        <div class="text-center mb-4 p-3 space-x-2 text-lg">
          Selected:
          <span class="text-wt-primary">
            {{ selectedAccountTypeNewUser() === UserAccountEnum.DEMO_TRADING ? 'Demo Trading' : 'Basic Account' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <!-- trading account -->
          <div
            class="p-3 rounded-lg border "
            tabindex="0"
            [ngClass]="{
              'border-wt-primary border-2 pointer-events-none':
                selectedAccountTypeNewUser() === UserAccountEnum.DEMO_TRADING,
              'g-clickable-hover opacity-85 hover:opacity-100 bg-wt-gray-light-strong hover:bg-transparent':
                selectedAccountTypeNewUser() !== UserAccountEnum.DEMO_TRADING
            }"
            (keydown.enter)="changeAccount(UserAccountEnum.DEMO_TRADING)"
            (click)="changeAccount(UserAccountEnum.DEMO_TRADING)"
          >
            <div class="mb-2 text-lg text-wt-primary text-center">Demo Trading</div>
            <div class="mb-3 text-center font-bold">(Schools or practising trading)</div>
            <div *ngFor="let text of accountDescription.DEMO_TRADING" class="mb-3 text-center">
              {{ text }}
            </div>
          </div>

          <!-- basic account -->
          <div
            class="p-3 rounded-lg border"
            tabindex="0"
            [ngClass]="{
              'border-wt-primary border-2 pointer-events-none':
                selectedAccountTypeNewUser() === UserAccountEnum.NORMAL_BASIC,
              'g-clickable-hover opacity-85 hover:opacity-100 bg-wt-gray-light-strong hover:bg-transparent':
                selectedAccountTypeNewUser() !== UserAccountEnum.NORMAL_BASIC
            }"
            (keydown.enter)="changeAccount(UserAccountEnum.NORMAL_BASIC)"
            (click)="changeAccount(UserAccountEnum.NORMAL_BASIC)"
          >
            <div class="mb-2 text-lg text-wt-primary text-center">Basic Account</div>
            <div class="mb-3 text-center font-bold">(Personal use)</div>
            <div *ngFor="let text of accountDescription.NORMAL_BASIC" class="mb-3 text-center">
              {{ text }}
            </div>
          </div>
        </div>

        <!-- action buttons -->
        <div class="g-mat-dialog-actions-full">
          <button type="button" mat-flat-button (click)="onCancel()">Cancel</button>
          <button type="button" mat-flat-button (click)="onConfirm()" color="primary">Create</button>
        </div>
      </div>
    </mat-dialog-content>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticationNewAccountTypeChooseDialogComponent {
  private dialogRef = inject(MatDialogRef<AuthenticationNewAccountTypeChooseDialogComponent>);
  private cd = inject(ChangeDetectorRef);
  accountDescription = accountDescription;
  UserAccountEnum = UserAccountEnum;

  selectedAccountTypeNewUser = signal<UserAccountBasicTypes>(UserAccountEnum.DEMO_TRADING);

  changeAccount(selected: UserAccountBasicTypes): void {
    this.selectedAccountTypeNewUser.set(selected);
    // trigger change detection because the template does not update the selected class
    this.cd.detectChanges();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedAccountTypeNewUser());
  }
}
