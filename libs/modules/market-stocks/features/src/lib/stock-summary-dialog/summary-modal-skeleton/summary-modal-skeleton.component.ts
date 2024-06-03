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
        <div class="g-skeleton h-12 w-12"></div>
        <div class="grid gap-1">
          <div class="text-md text-wt-gray-medium flex gap-3">
            <span class="g-skeleton h-4 w-10"></span>
            <span class="g-skeleton h-4 w-6"></span>
            <span class="g-skeleton h-4 w-10"></span>
          </div>

          <span class="g-skeleton h-7 w-28"></span>
        </div>
      </div>

      <!-- action buttons -->
      <div class="flex flex-col justify-between gap-x-8 gap-y-2 px-4 sm:flex-row">
        <div class="g-skeleton h-11 w-full sm:w-[220px]"></div>
        <div class="g-skeleton h-11 w-full sm:w-[180px]"></div>
      </div>
    </div>

    <!-- display main metrics -->
    <div class="mb-4 pl-4">
      <div class="flex justify-around">
        <!-- price -->
        <div class="g-skeleton h-[90px] max-sm:w-full sm:min-w-[275px]"></div>

        <!-- market cap -->
        <div class="g-skeleton hidden h-[90px] sm:block sm:min-w-[150px]"></div>

        <!-- PE -->
        <div class="g-skeleton hidden h-[90px] sm:min-w-[100px] md:block"></div>

        <!-- EPS -->
        <div class="g-skeleton hidden h-[90px] sm:min-w-[100px] lg:block"></div>

        <!-- Sector -->
        <div class="g-skeleton hidden h-[90px] w-[130px] xl:block"></div>
      </div>
    </div>

    <!-- time period change -->
    <div class="flex flex-col justify-around gap-4 pl-4 sm:flex-row">
      <div *ngRange="6" class="g-skeleton h-12 w-full sm:w-20"></div>
    </div>

    <!-- time period form control -->
    <div class="my-4 pl-4">
      <!-- large screen buttons -->
      <div class="hidden flex-wrap items-center gap-3 md:flex">
        <div *ngRange="9" class="g-skeleton h-11 flex-1"></div>
      </div>

      <!-- select on small screen -->
      <div class="g-skeleton block h-12 w-full md:hidden"></div>
    </div>

    <!-- chart title and date range -->
    <div class="mb-3 flex justify-between pl-4">
      <div class="g-skeleton h-6 sm:w-[125px]"></div>
      <div class="g-skeleton h-6 sm:w-[350px]"></div>
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
