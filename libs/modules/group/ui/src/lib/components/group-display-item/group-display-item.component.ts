import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { GROUP_MEMBER_LIMIT, GroupBase } from '@mm/api-types';
import { ClickableDirective, DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-group-display-item',
  standalone: true,
  imports: [
    CommonModule,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
    PercentageIncreaseDirective,
    MatRippleModule,
  ],
  template: `
    <div
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickableDirective.clickable()"
      [matRippleUnbounded]="false"
      class="@container flex flex-col gap-1 p-2"
    >
      <div class="flex gap-4">
        <!-- image -->
        <img appDefaultImg [src]="groupData().imageUrl" alt="Group image" class="h-16 w-16" />

        <!-- info -->
        <div class="grid gap-1">
          <div class="@md:flex-row @md:items-center flex flex-col gap-x-4">
            <div class="flex flex-wrap gap-x-2">
              <!-- name -->
              <span
                class="text-lg"
                [ngClass]="{
                  'text-wt-primary': !groupData().isClosed,
                  'text-wt-danger': groupData().isClosed,
                }"
              >
                {{ groupData().name | titlecase }}
              </span>
            </div>

            <!-- open groups -->
            @if (!groupData().isClosed) {
              <!-- total portfolio change -->
              <div
                class="@md:flex hidden"
                appPercentageIncrease
                [useCurrencySign]="true"
                [changeValues]="{
                  changePercentage: changePercentage(),
                }"
              ></div>
            } @else {
              <!-- closed group display message -->
              <div class="text-wt-danger">(Closed)</div>
            }
          </div>
          <div class="flex items-center gap-4">
            <!-- owner -->
            <div class="flex items-center gap-4">
              <img
                appDefaultImg
                [src]="groupData().ownerUser.personal.photoURL"
                alt="Owner image"
                class="h-8 w-8 rounded-full"
              />
              <span class="@md:block hidden">{{ groupData().ownerUser.personal.displayName | titlecase }}</span>
              <span class="@md:hidden block">{{ groupData().ownerUser.personal.displayNameInitials }}</span>
            </div>
            <!-- members -->
            <div>[{{ groupData().numberOfMembers }} / {{ memberLimit }}]</div>
          </div>
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
export class GroupDisplayItemComponent {
  readonly clickableDirective = inject(ClickableDirective);
  readonly groupData = input.required<GroupBase>();

  /**
   * whether to show daily portfolio change or total portfolio change
   */
  readonly showDailyPortfolioChange = input(false);

  readonly changePercentage = computed(() =>
    this.showDailyPortfolioChange()
      ? this.groupData().portfolioState.previousBalanceChangePercentage
      : this.groupData().portfolioState.totalGainsPercentage,
  );

  readonly memberLimit = GROUP_MEMBER_LIMIT;
}
