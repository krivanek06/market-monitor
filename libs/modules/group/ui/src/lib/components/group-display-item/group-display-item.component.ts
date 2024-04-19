import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
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
    ClickableDirective,
  ],
  template: `
    <div
      matRipple
      [matRippleCentered]="true"
      [matRippleDisabled]="!clickableDirective.clickable()"
      [matRippleUnbounded]="false"
      class="flex flex-col gap-1 p-2 @container"
    >
      <div class="flex gap-4">
        <!-- image -->
        <img appDefaultImg [src]="groupData().imageUrl" alt="Group image" class="w-16 h-16" />

        <!-- info -->
        <div class="grid gap-1">
          <div class="flex flex-col @md:flex-row @md:items-center gap-x-4">
            <div class="flex flex-wrap gap-x-2">
              <!-- name -->
              <span
                class="text-lg"
                [ngClass]="{
                  'text-wt-primary': !groupData().isClosed,
                  'text-wt-danger': groupData().isClosed
                }"
              >
                {{ groupData().name | titlecase }}
              </span>

              <!-- members -->
              <span class="block @md:hidden">[{{ groupData().numberOfMembers }} / {{ memberLimit }}]</span>
            </div>

            <!-- portfolio -->
            <div
              *ngIf="!groupData().isClosed"
              appPercentageIncrease
              [useCurrencySign]="true"
              [changeValues]="{
                change: groupData().portfolioState.totalGainsValue,
                changePercentage: groupData().portfolioState.totalGainsPercentage
              }"
            ></div>
            <!-- closed group display message -->
            <div *ngIf="groupData().isClosed" class="text-wt-danger">(Closed)</div>
          </div>
          <div class="hidden @md:flex items-center gap-4">
            <!-- owner -->
            <div class="flex items-center gap-4">
              <img
                appDefaultImg
                [src]="groupData().ownerUser.personal.photoURL"
                alt="Owner image"
                class="w-8 h-8 rounded-full"
              />
              <span>{{ groupData().ownerUser.personal.displayName | titlecase }}</span>
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
  clickableDirective = inject(ClickableDirective);
  groupData = input.required<GroupBase>();

  memberLimit = GROUP_MEMBER_LIMIT;
}
