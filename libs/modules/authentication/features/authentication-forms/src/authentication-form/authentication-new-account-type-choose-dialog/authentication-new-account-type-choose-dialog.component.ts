import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { UserAccountEnum, accountDescription } from '@mm/api-types';

export type SelectableAccountType = UserAccountEnum.DEMO_TRADING | UserAccountEnum.NORMAL_BASIC;

@Component({
  selector: 'app-authentication-new-account-type-choose-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="max-w-[750px]">
      <!-- description -->
      <div class="text-center mb-4 p-3">
        When creating an account you can choose either a demo trading account or a basic account. You can also change it
        in the settings.
      </div>

      <!-- selected account -->
      <div class="text-center mb-4 p-3 space-x-2 text-lg">
        Selected:
        <span class="text-wt-primary">{{
          selectedAccountTypeNewUser() === UserAccountEnum.DEMO_TRADING ? 'Demo Trading' : 'Basic Account'
        }}</span>
      </div>

      <div class="grid grid-cols-2 gap-6 mb-6">
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
      </div>

      <!-- action buttons -->
      <div class="g-mat-dialog-actions-full">
        <button type="button" mat-flat-button (click)="onCancel()">Cancel</button>
        <button type="button" mat-flat-button (click)="onConfirm()" color="primary">Create</button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticationNewAccountTypeChooseDialogComponent {
  cancelEmitter = output<void>();
  confirmEmitter = output<SelectableAccountType>();

  accountDescription = accountDescription;
  UserAccountEnum = UserAccountEnum;

  selectedAccountTypeNewUser = signal<SelectableAccountType>(UserAccountEnum.DEMO_TRADING);

  changeAccount(selected: SelectableAccountType): void {
    this.selectedAccountTypeNewUser.set(selected);
  }

  onCancel(): void {
    this.cancelEmitter.emit();
  }

  onConfirm(): void {
    this.confirmEmitter.emit(this.selectedAccountTypeNewUser());
  }
}
