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
        <div class="mb-4 p-3 text-center">
          When creating an account you can choose either a demo trading account or a basic account. You can also change
          it in the settings.
        </div>

        <!-- selected account -->
        <div class="mb-4 space-x-2 p-3 text-center text-lg">
          Selected:
          <span class="text-wt-primary">
            {{ selectedAccountTypeNewUser() === UserAccountEnum.DEMO_TRADING ? 'Demo Trading' : 'Basic Account' }}
          </span>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-6">
          <!-- trading account -->
          <div
            class="rounded-lg border p-3"
            tabindex="0"
            [ngClass]="{
              'border-wt-primary pointer-events-none border-2':
                selectedAccountTypeNewUser() === UserAccountEnum.DEMO_TRADING,
              'g-clickable-hover bg-wt-gray-light-strong opacity-85 hover:bg-transparent hover:opacity-100':
                selectedAccountTypeNewUser() !== UserAccountEnum.DEMO_TRADING
            }"
            (keydown.enter)="changeAccount(UserAccountEnum.DEMO_TRADING)"
            (click)="changeAccount(UserAccountEnum.DEMO_TRADING)"
          >
            <div class="text-wt-primary mb-2 text-center text-lg">Demo Trading</div>
            <div class="mb-3 text-center font-bold">(Schools or practising trading)</div>
            <div *ngFor="let text of accountDescription.DEMO_TRADING" class="mb-3 text-center">
              {{ text }}
            </div>
          </div>

          <!-- basic account -->
          <div
            class="rounded-lg border p-3"
            tabindex="0"
            [ngClass]="{
              'border-wt-primary pointer-events-none border-2':
                selectedAccountTypeNewUser() === UserAccountEnum.NORMAL_BASIC,
              'g-clickable-hover bg-wt-gray-light-strong opacity-85 hover:bg-transparent hover:opacity-100':
                selectedAccountTypeNewUser() !== UserAccountEnum.NORMAL_BASIC
            }"
            (keydown.enter)="changeAccount(UserAccountEnum.NORMAL_BASIC)"
            (click)="changeAccount(UserAccountEnum.NORMAL_BASIC)"
          >
            <div class="text-wt-primary mb-2 text-center text-lg">Basic Account</div>
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
