import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GROUP_MEMBER_LIMIT, GroupData, UserBase } from '@mm/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-group-display-info',
  standalone: true,
  imports: [
    NgClass,
    TitleCasePipe,
    DatePipe,
    DefaultImgDirective,
    MatButtonModule,
    MatIconModule,
    PercentageIncreaseDirective,
  ],
  template: `
    <div class="mb-3 flex items-center gap-3 lg:hidden">
      <!-- name -->
      <div
        class="text-start text-lg"
        [ngClass]="{
          'text-wt-primary': !groupData().isClosed,
          'text-wt-danger': groupData().isClosed,
        }"
      >
        {{ groupData().name | titlecase }}
      </div>
      <!-- portfolio -->
      @if (!groupData().isClosed) {
        <div
          appPercentageIncrease
          [useCurrencySign]="true"
          [changeValues]="{
            change: groupData().portfolioState.totalGainsValue,
            changePercentage: groupData().portfolioState.totalGainsPercentage,
          }"
        ></div>
      }
    </div>
    <div class="xs:flex-row flex flex-1 flex-col gap-3 lg:items-center">
      <!-- image -->
      <img
        appDefaultImg
        [src]="groupData().imageUrl"
        alt="Group Image"
        class="xs:block -mt-2 hidden h-[120px] w-[120px] object-cover lg:h-[150px] lg:w-[150px]"
      />
      <!-- data -->
      <div class="flex flex-1 flex-col">
        <div class="flex items-center gap-4 max-sm:justify-between">
          <!-- name -->
          <div
            class="hidden text-lg lg:block"
            [ngClass]="{
              'text-wt-primary': !groupData().isClosed,
              'text-wt-danger': groupData().isClosed,
            }"
          >
            {{ groupData().name | titlecase }}
          </div>
          <!-- closed group display message -->
          @if (groupData().isClosed) {
            <div class="text-wt-danger">(Closed)</div>
          }
        </div>
        <!-- owner -->
        <div
          (click)="onOwnerClick()"
          class="flex max-w-fit items-center gap-2 rounded-lg px-1 py-2"
          [ngClass]="{
            'g-clickable-hover-color': clickableOwner(),
            'hover:shadow-lg': clickableOwner(),
          }"
        >
          <img
            appDefaultImg
            [src]="groupData().ownerUser.personal.photoURL"
            alt="Owner Image"
            class="h-8 w-8 rounded-full"
          />
          <span>{{ groupData().ownerUser.personal.displayName | titlecase }}</span>
        </div>
        <!-- status -->
        <div class="flex gap-2 max-sm:justify-between">
          <div class="text-wt-gray-dark w-20">Status</div>
          <div
            class="flex items-center gap-2"
            [ngClass]="{
              'text-wt-success': groupData().isPublic,
              'text-wt-danger': !groupData().isPublic,
            }"
          >
            @if (groupData().isPublic) {
              <mat-icon color="accent">lock_open</mat-icon>
            } @else {
              <mat-icon color="warn">lock</mat-icon>
            }
            <span>{{ groupData().isPublic ? 'Open' : 'Closed' }}</span>
          </div>
        </div>

        <!-- members -->
        <div class="flex gap-2 max-sm:justify-between">
          <div class="text-wt-gray-dark w-20">Members</div>
          <div>{{ groupData().memberUserIds.length }} / {{ GROUP_MEMBER_LIMIT }}</div>
        </div>

        <!-- created date -->
        <div class="flex gap-2 max-sm:justify-between">
          <div class="text-wt-gray-dark w-20">Created</div>
          <div>{{ groupData().createdDate | date: 'MMM d, y' }}</div>
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
export class GroupDisplayInfoComponent {
  readonly ownerClickEmitter = output<UserBase>();

  readonly imageHeightPx = input(125);
  readonly groupData = input.required<GroupData>();
  readonly clickableOwner = input(false);

  readonly GROUP_MEMBER_LIMIT = GROUP_MEMBER_LIMIT;

  onOwnerClick(): void {
    if (this.clickableOwner()) {
      this.ownerClickEmitter.emit(this.groupData().ownerUser);
    }
  }
}
