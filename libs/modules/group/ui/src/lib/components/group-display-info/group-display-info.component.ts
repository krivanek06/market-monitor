import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GROUP_MEMBER_LIMIT, GroupData, UserBase } from '@market-monitor/api-types';
import { DefaultImgDirective, PercentageIncreaseDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-group-display-info',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, MatButtonModule, MatIconModule, PercentageIncreaseDirective],
  template: `
    <!-- name -->
    <div
      class="block sm:hidden text-lg text-start mb-3"
      [ngClass]="{
        'text-wt-primary': !groupData().isClosed,
        'text-wt-danger': groupData().isClosed
      }"
    >
      {{ groupData().name | titlecase }}
    </div>
    <div class="flex flex-col xs:flex-row xs:items-center flex-1 gap-3">
      <!-- image -->
      <img
        appDefaultImg
        [src]="groupData().imageUrl"
        alt="Group Image"
        class="object-cover -mt-2 hidden xs:block"
        [style.height.px]="imageHeightPx()"
        [style.width.px]="imageHeightPx()"
      />
      <!-- data -->
      <div class="flex flex-col">
        <div class="flex gap-4 items-center">
          <!-- name -->
          <div
            class="hidden sm:block text-lg"
            [ngClass]="{
              'text-wt-primary': !groupData().isClosed,
              'text-wt-danger': groupData().isClosed
            }"
          >
            {{ groupData().name | titlecase }}
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
        <!-- owner -->
        <div
          (click)="onOwnerClick()"
          class="flex items-center gap-2 px-1 py-2 rounded-lg"
          [ngClass]="{
            'g-clickable-hover': clickableOwner(),
            'hover:shadow-lg': clickableOwner()
          }"
        >
          <img
            appDefaultImg
            [src]="groupData().ownerUser.personal.photoURL"
            alt="Owner Image"
            class="w-8 h-8 rounded-full"
          />
          <span>{{ groupData().ownerUser.personal.displayName | titlecase }}</span>
        </div>
        <!-- status -->
        <div class="flex gap-2">
          <div class="w-20 text-wt-gray-dark">Status</div>
          <div
            class="flex items-center gap-2"
            [ngClass]="{
              'text-wt-success': groupData().isPublic,
              'text-wt-danger': !groupData().isPublic
            }"
          >
            <mat-icon *ngIf="groupData().isPublic" color="accent">lock_open</mat-icon>
            <mat-icon *ngIf="!groupData().isPublic" color="warn">lock</mat-icon>
            <span>{{ groupData().isPublic ? 'Open' : 'Closed' }}</span>
          </div>
        </div>
        <!-- members -->
        <div class="flex gap-2">
          <div class="w-20 text-wt-gray-dark">Members</div>
          <div>{{ groupData().memberUserIds.length }} / {{ GROUP_MEMBER_LIMIT }}</div>
        </div>
        <!-- created date -->
        <div class="flex gap-2">
          <div class="w-20 text-wt-gray-dark">Created</div>
          <div>{{ groupData().createdDate | date: 'MMMM d, y' }}</div>
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
  ownerClickEmitter = output<UserBase>();

  imageHeightPx = input(125);
  groupData = input.required<GroupData>();
  clickableOwner = input(false);

  GROUP_MEMBER_LIMIT = GROUP_MEMBER_LIMIT;

  onOwnerClick(): void {
    if (this.clickableOwner()) {
      this.ownerClickEmitter.emit(this.groupData().ownerUser);
    }
  }
}
