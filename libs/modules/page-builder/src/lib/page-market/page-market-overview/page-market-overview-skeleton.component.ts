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
    <div class="flex gap-3 p-2 mb-6 xl:justify-around md:grid-cols-2 max-md:overflow-x-scroll md:grid xl:flex">
      <div *ngRange="4" class="w-full lg:min-w-[320px] px-6 py-3 h-[115px] g-skeleton"></div>
    </div>

    <!-- index select -->
    <div class="flex max-sm:w-full mb-3">
      <div class="min-w-[300px] max-sm:w-full g-skeleton h-12"></div>
    </div>

    <!-- chart -->
    <div class="mb-10">
      <div class="h-[400px] w-full g-skeleton"></div>
    </div>

    <div class="w-full mx-auto max-sm:pr-3 lg:w-11/12">
      <!-- SP 500 -->
      <div class="w-[200px] h-8 g-skeleton mb-4"></div>
      <div class="grid grid-cols-1 mb-10 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
        <div *ngRange="6" class="h-[275px] w-full g-skeleton"></div>
      </div>

      <!-- Inflation rate -->
      <div class="w-[200px] h-8 g-skeleton mb-4"></div>
      <div class="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div *ngRange="4" class="h-[250px] w-full g-skeleton"></div>
      </div>

      <!-- Treasury -->
      <div class="w-[200px] h-8 g-skeleton mb-4"></div>
      <div class="grid grid-cols-1 mb-10 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
        <div *ngRange="4" class="h-[250px] w-full g-skeleton"></div>
      </div>

      <!-- Bonds -->
      <div class="w-[200px] h-8 g-skeleton mb-4"></div>
      <div class="grid grid-cols-1 gap-4 mb-3 sm:grid-cols-2 lg:grid-cols-4">
        <div *ngRange="4" class="h-[250px] w-full g-skeleton"></div>
      </div>

      <!-- Consumer Price Index -->
      <div class="w-[200px] h-8 g-skeleton mb-4"></div>
      <div class="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div *ngRange="4" class="h-[250px] w-full g-skeleton"></div>
      </div>
    </div>
  `,
})
export class PageMarketOverviewSkeletonComponent {}
