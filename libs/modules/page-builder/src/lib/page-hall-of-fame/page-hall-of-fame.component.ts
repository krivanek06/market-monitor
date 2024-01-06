import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabelValue } from '@market-monitor/shared/data-access';
import { TabSelectControlComponent } from '@market-monitor/shared/ui';
import { HallOfFameGroupsComponent } from './hall-of-fame-groups/hall-of-fame-groups.component';
import { HallOfFameUsersComponent } from './hall-of-fame-users/hall-of-fame-users.component';

@Component({
  selector: 'app-page-hall-of-fame',
  standalone: true,
  imports: [
    CommonModule,
    TabSelectControlComponent,
    ReactiveFormsModule,
    HallOfFameUsersComponent,
    HallOfFameGroupsComponent,
  ],
  template: `
    <div class="flex justify-end mb-6 lg:mb-10">
      <app-tab-select-control [formControl]="currentPageControl" [displayOptions]="navLabels"></app-tab-select-control>
    </div>
    <div class="relative">
      @if (currentPageControl.value === 'users') {
        <app-hall-of-fame-users />
      } @else if (currentPageControl.value === 'groups') {
        <app-hall-of-fame-groups />
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
  currentPageControl = new FormControl<'users' | 'groups'>('users');
  navLabels: LabelValue<'users' | 'groups'>[] = [
    {
      label: 'Users',
      value: 'users',
    },
    {
      label: 'Groups',
      value: 'groups',
    },
  ];
}
