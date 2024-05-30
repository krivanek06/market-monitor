import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@mm/api-client';
import { NewsTypes } from '@mm/api-types';
import {
  DateAgoPipe,
  DefaultImgDirective,
  RangeDirective,
  ScrollNearEndDirective,
  TruncateWordsPipe,
} from '@mm/shared/ui';
import { derivedFrom } from 'ngxtension/derived-from';
import { map, pipe, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-news-search',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RangeDirective,
    ScrollNearEndDirective,
    DateAgoPipe,
    TruncateWordsPipe,
    DefaultImgDirective,
  ],
  template: `
    <!-- loaded news -->
    @if (!marketStockNewsSignal().isLoading) {
      <div appScrollNearEnd [(nearEnd)]="displayMoreNotification" class="grid grid-cols-1 md:grid-cols-2">
        @for (news of marketStockNewsSignal().data; track news.title) {
          <article class="inline-block m-2 transition-all duration-300 group hover:scale-95">
            <a
              class="relative flex flex-col items-start gap-3 pt-2 pb-4 pl-2 pr-4 overflow-hidden transition-all duration-500 rounded-lg max-lg:p-0 lg:flex-row hover:bg-wt-gray-light"
              target="_blank"
              [href]="news.url"
            >
              <img
                appDefaultImg
                [src]="news.image"
                [alt]="news.title"
                class="h-[255px] sm:h-[275px] object-cover lg:h-28 lg:w-36 min-w-[9rem] max-lg:m-auto w-full lg:pt-1"
              />
              <div class="flex flex-col max-lg:absolute p-2 xs:p-4 sm:p-6 lg:p-0 max-lg:bottom-0 max-lg:bg-[#ffffffbf]">
                <div class="text-base text-wt-gray-dark group-hover:text-wt-primary">
                  {{ news.title }}
                </div>
                <div class="hidden space-x-1 text-xs text-wt-gray-medium lg:block">
                  <span>{{ news.site }}</span>
                  <span>●</span>
                  <span>{{ news.publishedDate | dateAgo }}</span>
                </div>
                <div class="hidden text-sm lg:block text-wt-gray-medium">{{ news.text | truncateWords: 25 }}</div>
              </div>
            </a>
          </article>
        }
      </div>
    } @else {
      <!-- loading screen -->
      <div class="columns-1 md:columns-2">
        <div
          *ngRange="initialNewsToDisplay()"
          class="flex flex-col items-start gap-3 pt-2 pb-4 pl-2 pr-4 rounded-md max-lg:p-0 lg:flex-row"
        >
          <!-- image -->
          <div
            class="h-[255px] sm:h-[275px] object-cover lg:h-28 lg:w-36 min-w-[9rem] max-lg:m-auto w-full lg:pt-1 g-skeleton"
          ></div>
          <div class="flex flex-col w-full gap-1 lg:block">
            <!-- title -->
            <div class="hidden w-full h-6 g-skeleton lg:block mb-1"></div>
            <!-- creator -->
            <div class="hidden w-full h-6 g-skeleton lg:block mb-1"></div>
            <div class="hidden w-full h-20 lg:block g-skeleton"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSearchComponent {
  private marketApiService = inject(MarketApiService);

  initialNewsToDisplay = input(16);

  searchData = input<{ newsType: NewsTypes; symbol?: string }>({ newsType: 'stocks', symbol: 'AAPL' });

  /**
   * will emit incremented number every time user scrolls near end
   */
  displayMoreNotification = signal(0);

  private readonly newDisplay = 16;

  marketStockNewsSignal = derivedFrom(
    [this.searchData, this.displayMoreNotification],
    pipe(
      switchMap(([searchData, increment]) =>
        this.marketApiService.getNews(searchData.newsType, searchData.symbol).pipe(
          map((news) => ({
            data: news.slice(0, this.initialNewsToDisplay() + increment * this.newDisplay),
            isLoading: false,
          })),
          startWith({ data: [], isLoading: true }),
        ),
      ),
    ),
  );
}
