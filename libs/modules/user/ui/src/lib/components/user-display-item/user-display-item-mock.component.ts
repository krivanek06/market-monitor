import { Component, input, output } from '@angular/core';
import { UserBase } from '@mm/api-types';

@Component({
  selector: 'app-user-display-item',
  standalone: true,
  template: ``,
})
export class UserDisplayItemComponentMock {
  itemClicked = output<void>();
  clickable = input(false);
  showDailyPortfolioChange = input(true);
  userData = input<UserBase>();
}
