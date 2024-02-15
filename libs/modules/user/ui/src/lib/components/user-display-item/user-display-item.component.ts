import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT, UserBase } from '@market-monitor/api-types';
import { DefaultImgDirective, LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@market-monitor/shared/ui';
import { isBefore, subDays } from 'date-fns';

@Component({
  selector: 'app-user-display-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, LargeNumberFormatterPipe, MatIconModule, PercentageIncreaseDirective],
  template: `
    <div class="flex gap-4">
      <img appDefaultImg [src]="userData.personal.photoURL" alt="User Image" class="w-14 h-14 rounded-md" />

      <!-- info -->
      <div class="flex flex-col text-sm">
        <div class="flex">
          <div class="text-wt-gray-dark w-[80px]">Name:</div>
          <div class="mr-4">{{ userData.personal.displayName }}</div>
          <!-- active user -->
          <mat-icon *ngIf="showLoginButton" [color]="isUserActive ? 'accent' : 'warn'" class="hidden sm:block">
            radio_button_checked
          </mat-icon>
        </div>

        <div class="flex">
          <div class="text-wt-gray-dark w-[80px]">Balance:</div>
          <div class="flex items-center gap-2">
            <div>{{ userData.portfolioState.balance | largeNumberFormatter: false : true }}</div>
            <div
              *ngIf="userData.portfolioState.previousBalanceChangePercentage > 0"
              appPercentageIncrease
              [changeValues]="{
                changePercentage: userData.portfolioState.previousBalanceChangePercentage
              }"
            ></div>
          </div>
        </div>

        <div class="flex">
          <div class="text-wt-gray-dark w-[80px]">Login:</div>
          <span>{{ userData.lastLoginDate | date: 'MMMM d, y' }}</span>
        </div>
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
export class UserDisplayItemComponent {
  @Input({ required: true }) userData!: UserBase;
  @Input() showLoginButton = true;

  USER_ACTIVE_ACCOUNT_TIME_DAYS = USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT;

  get isUserActive(): boolean {
    return isBefore(subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT), new Date(this.userData.lastLoginDate));
  }
}
