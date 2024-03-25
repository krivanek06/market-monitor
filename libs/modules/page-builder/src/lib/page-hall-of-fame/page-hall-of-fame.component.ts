import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabelValue } from '@mm/shared/data-access';
import { TabSelectControlComponent } from '@mm/shared/ui';
import { CompareUsersComponent } from './compare-users/compare-users.component';
import { HallOfFameGroupsComponent } from './hall-of-fame-groups/hall-of-fame-groups.component';
import { HallOfFameUsersComponent } from './hall-of-fame-users/hall-of-fame-users.component';

type SubPages = 'users' | 'groups' | 'compare-users';

@Component({
  selector: 'app-page-hall-of-fame',
  standalone: true,
  imports: [
    CommonModule,
    TabSelectControlComponent,
    ReactiveFormsModule,
    HallOfFameUsersComponent,
    HallOfFameGroupsComponent,
    CompareUsersComponent,
  ],
  template: `
    <div class="flex justify-end mb-6 lg:mb-10">
      <app-tab-select-control
        class="max-md:w-full"
        [formControl]="currentPageControl"
        [displayOptions]="navLabels"
      ></app-tab-select-control>
    </div>
    <div class="relative">
      @if (currentPageControl.value === 'users') {
        <app-hall-of-fame-users />
      } @else if (currentPageControl.value === 'groups') {
        @defer {
          <app-hall-of-fame-groups />
        }
      } @else if (currentPageControl.value === 'compare-users') {
        @defer {
          <app-compare-users />
        }
      } @else {
        Invalid page
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHallOfFameComponent {
  currentPageControl = new FormControl<SubPages>('users');
  navLabels: LabelValue<SubPages>[] = [
    {
      label: 'Users',
      value: 'users',
    },
    {
      label: 'Groups',
      value: 'groups',
    },
    {
      label: 'Compare Users',
      value: 'compare-users',
    },
  ];
}
