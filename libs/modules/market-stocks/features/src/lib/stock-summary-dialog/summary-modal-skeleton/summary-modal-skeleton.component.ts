import { Component } from '@angular/core';

@Component({
  selector: 'app-summary-modal-skeleton',
  standalone: true,
  imports: [],
  template: `
    <!-- heading -->
    <div class="mb-2 flex flex-col gap-y-6 p-4 md:-mt-1 lg:flex-row lg:justify-between">
      <!-- symbol info -->
      <div class="flex items-center gap-3">
        <div class="g-skeleton h-12 w-12"></div>
        <div class="grid gap-1">
          <div class="text-wt-gray-medium flex gap-3 text-lg">
            <span class="g-skeleton h-4 w-10"></span>
            <span class="g-skeleton h-4 w-6"></span>
            <span class="g-skeleton h-4 w-10"></span>
          </div>

          <span class="g-skeleton h-7 w-28"></span>
        </div>
      </div>

      <!-- action buttons -->
      <div class="flex flex-row justify-between gap-x-4 gap-y-2 px-4">
        <div class="g-skeleton h-10 w-full sm:w-[205px]"></div>
        <div class="g-skeleton h-10 w-full sm:w-[160px]"></div>
      </div>
    </div>

    <!-- display main metrics -->
    <div class="mb-6 pl-4 pr-4">
      <div class="flex justify-around">
        <!-- price -->
        <div class="g-skeleton h-[90px] max-sm:w-full sm:min-w-[250px]"></div>

        <!-- market cap -->
        <div class="g-skeleton h-[90px] max-sm:hidden sm:min-w-[150px]"></div>

        <!-- PE -->
        <div class="g-skeleton h-[90px] max-sm:hidden sm:min-w-[100px]"></div>

        <!-- EPS -->
        <div class="g-skeleton h-[90px] max-md:hidden sm:min-w-[100px]"></div>

        <!-- Sector -->
        <div class="g-skeleton h-[90px] w-[130px] max-lg:hidden"></div>
      </div>
    </div>

    <!-- time period change -->
    <div
      class="grid grid-cols-2 justify-around gap-4 pl-4 max-sm:hidden sm:grid-cols-3 md:flex md:flex-row md:flex-wrap"
    >
      <div class="g-skeleton mx-auto h-12 w-9/12 md:w-20"></div>
      <div class="g-skeleton mx-auto h-12 w-9/12 md:w-20"></div>
      <div class="g-skeleton mx-auto h-12 w-9/12 md:w-20"></div>
      <div class="g-skeleton mx-auto h-12 w-9/12 md:w-20"></div>
      <div class="g-skeleton mx-auto h-12 w-9/12 md:w-20"></div>
      <div class="g-skeleton mx-auto h-12 w-9/12 md:w-20"></div>
    </div>

    <!-- time period form control -->
    <div class="my-6 pl-4 pr-4">
      <!-- large screen buttons -->
      <div class="hidden flex-wrap items-center gap-3 md:flex">
        <div class="g-skeleton h-11 flex-1"></div>
        <div class="g-skeleton h-11 flex-1"></div>
        <div class="g-skeleton h-11 flex-1"></div>
        <div class="g-skeleton h-11 flex-1"></div>
        <div class="g-skeleton h-11 flex-1"></div>
        <div class="g-skeleton h-11 flex-1"></div>
        <div class="g-skeleton h-11 flex-1"></div>
      </div>

      <!-- select on small screen -->
      <div class="g-skeleton block h-12 w-full md:hidden"></div>
    </div>

    <!-- chart title and date range -->
    <div class="mb-2 flex justify-between pl-4 pr-4">
      <div class="g-skeleton h-6 w-[100px] sm:w-[125px]"></div>
      <div class="g-skeleton h-6 w-[150px] sm:w-[350px]"></div>
    </div>

    <!-- price & volume chart -->
    <div class="pl-4 pr-4">
      <div class="g-skeleton h-[390px]"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SummaryModalSkeletonComponent {}
