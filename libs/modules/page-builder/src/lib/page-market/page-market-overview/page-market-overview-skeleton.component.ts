import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RangeDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-page-market-overview-skeleton',
  standalone: true,
  imports: [CommonModule, RangeDirective],
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 flex gap-3 p-2 max-md:overflow-x-scroll md:grid md:grid-cols-2 xl:flex xl:justify-around">
      <div *ngRange="4" class="g-skeleton h-[115px] w-full px-6 py-3 lg:min-w-[320px]"></div>
    </div>

    <!-- index select -->
    <div class="mb-3 flex max-sm:w-full">
      <div class="g-skeleton h-12 min-w-[500px] max-sm:w-full"></div>
    </div>

    <!-- chart -->
    <div class="mb-10">
      <div class="g-skeleton h-[400px] w-full"></div>
    </div>

    <div class="mx-auto w-full max-sm:pr-3 lg:w-11/12">
      <!-- SP 500 -->
      <div class="g-skeleton mb-4 h-8 w-[200px]"></div>
      <div class="mb-10 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <div *ngRange="6" class="g-skeleton h-[275px] w-full"></div>
      </div>

      <!-- Inflation rate -->
      <div class="g-skeleton mb-4 h-8 w-[200px]"></div>
      <div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div *ngRange="4" class="g-skeleton h-[250px] w-full"></div>
      </div>

      <!-- Treasury -->
      <div class="g-skeleton mb-4 h-8 w-[200px]"></div>
      <div class="mb-10 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <div *ngRange="4" class="g-skeleton h-[250px] w-full"></div>
      </div>

      <!-- Bonds -->
      <div class="g-skeleton mb-4 h-8 w-[200px]"></div>
      <div class="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div *ngRange="4" class="g-skeleton h-[250px] w-full"></div>
      </div>

      <!-- Consumer Price Index -->
      <div class="g-skeleton mb-4 h-8 w-[200px]"></div>
      <div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div *ngRange="4" class="g-skeleton h-[250px] w-full"></div>
      </div>
    </div>
  `,
})
export class PageMarketOverviewSkeletonComponent {}
