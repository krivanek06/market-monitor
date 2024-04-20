import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UserBase } from '@mm/api-types';
import {
  ClickableDirective,
  DefaultImgDirective,
  LargeNumberFormatterPipe,
  PercentageIncreaseDirective,
} from '@mm/shared/ui';

@Component({
  selector: 'app-user-display-item',
  standalone: true,
  imports: [
    CommonModule,
    DefaultImgDirective,
    LargeNumberFormatterPipe,
    MatIconModule,
    PercentageIncreaseDirective,
    ClickableDirective,
  ],
  template: `
    <div class="flex gap-4 @container">
      <img appDefaultImg [src]="userData().personal.photoURL" alt="User Image" class="w-14 h-14 rounded-md" />

      <!-- info -->
      <div class="flex flex-col text-sm">
        <!-- name -->
        <div class="flex">
          <div class="text-wt-gray-dark w-[80px]">Name:</div>
          <div class="flex-1">
            <span class="hidden @xs:block">{{ userData().personal.displayName }}</span>
            <span class="block @xs:hidden">{{ userData().personal.displayNameInitials }}</span>
          </div>
        </div>

        <!-- balance -->
        <div class="flex">
          <div class="text-wt-gray-dark w-[80px]">Balance:</div>
          <div class="flex items-center gap-2">
            <div>{{ userData().portfolioState.balance | largeNumberFormatter: false : true }}</div>
            <div
              appPercentageIncrease
              [changeValues]="{
                changePercentage: userData().portfolioState.previousBalanceChangePercentage
              }"
            ></div>
          </div>
        </div>

        <div class="flex">
          <div class="text-wt-gray-dark w-[80px]">Created:</div>
          <span>{{ userData().accountCreatedDate | date: 'MMMM d, y' }}</span>
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
  hostDirectives: [
    {
      directive: ClickableDirective,
      inputs: ['clickable'],
      outputs: ['itemClicked'],
    },
  ],
})
export class UserDisplayItemComponent {
  userData = input.required<UserBase>();
}
