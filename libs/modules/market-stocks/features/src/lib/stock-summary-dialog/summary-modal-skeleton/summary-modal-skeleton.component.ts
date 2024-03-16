import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RangeDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-summary-modal-skeleton',
  standalone: true,
  imports: [CommonModule, RangeDirective],
  template: `
    <!-- heading -->
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 g-skeleton"></div>
        <div class="grid gap-1">
          <div class="flex gap-3 text-md text-wt-gray-medium">
            <span class="w-10 h-4 g-skeleton"></span>
            <span class="w-6 h-4 g-skeleton"></span>
            <span class="w-10 h-4 g-skeleton"></span>
          </div>

          <span class="w-28 h-7 g-skeleton"></span>
        </div>
      </div>

      <!-- action buttons -->
      <div class="flex flex-col justify-between px-4 sm:flex-row gap-y-2 gap-x-8">
        <div class="g-skeleton w-full sm:w-[220px] h-11"></div>
        <div class="g-skeleton w-full sm:w-[180px] h-11"></div>
      </div>
    </div>

    <!-- display main metrics -->
    <div class="pl-4 mb-4">
      <div class="flex justify-around">
        <!-- price -->
        <div class="g-skeleton h-[90px] max-sm:w-full sm:min-w-[275px]"></div>

        <!-- market cap -->
        <div class="g-skeleton h-[90px] hidden sm:block sm:min-w-[150px]"></div>

        <!-- PE -->
        <div class="g-skeleton h-[90px] hidden md:block sm:min-w-[100px]"></div>

        <!-- EPS -->
        <div class="g-skeleton h-[90px] hidden lg:block sm:min-w-[100px]"></div>

        <!-- Sector -->
        <div class="g-skeleton w-[130px] h-[90px] hidden xl:block"></div>
      </div>
    </div>

    <!-- time period change -->
    <div class="flex flex-col justify-around gap-4 pl-4 sm:flex-row">
      <div *ngRange="6" class="w-full h-12 sm:w-20 g-skeleton"></div>
    </div>

    <!-- time period form control -->
    <div class="pl-4 my-4">
      <!-- large screen buttons -->
      <div class="flex-wrap items-center hidden gap-3 md:flex">
        <div *ngRange="9" class="flex-1 g-skeleton h-11"></div>
      </div>

      <!-- select on small screen -->
      <div class="block w-full h-12 md:hidden g-skeleton"></div>
    </div>

    <!-- chart title and date range -->
    <div class="flex justify-between pl-4 mb-3">
      <div class="g-skeleton sm:w-[125px] h-6"></div>
      <div class="g-skeleton sm:w-[350px] h-6"></div>
    </div>

    <!-- price & volume chart -->
    <div class="pl-4">
      <div class="g-skeleton h-[420px]"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SummaryModalSkeletonComponent {}
