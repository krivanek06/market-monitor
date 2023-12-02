import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserBase } from '@market-monitor/api-types';
import { USER_ACTIVE_ACCOUNT_TIME_DAYS } from '@market-monitor/modules/user/data-access';
import { DefaultImgDirective, LargeNumberFormatterPipe } from '@market-monitor/shared/ui';
import { isBefore, subDays } from 'date-fns';

@Component({
  selector: 'app-user-display-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, LargeNumberFormatterPipe],
  templateUrl: './user-display-item.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDisplayItemComponent {
  @Input({ required: true }) userData!: UserBase;

  USER_ACTIVE_ACCOUNT_TIME_DAYS = USER_ACTIVE_ACCOUNT_TIME_DAYS;

  get isUserActive(): boolean {
    return isBefore(subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS), new Date(this.userData.lastLoginDate));
  }
}
