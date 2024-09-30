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
          <article class="group m-2 inline-block transition-all duration-300 hover:scale-95">
            <a
              class="hover:bg-wt-gray-light relative flex flex-col items-start gap-3 overflow-hidden rounded-lg pb-4 pl-2 pr-4 pt-2 transition-all duration-500 max-lg:p-0 lg:flex-row"
              target="_blank"
              [href]="news.url"
            >
              <img
                appDefaultImg
                [src]="news.image"
                [alt]="news.title"
                class="h-[255px] w-full min-w-[9rem] object-cover max-lg:m-auto sm:h-[275px] lg:h-28 lg:w-36 lg:pt-1"
              />
              <div
                class="xs:p-4 max-lg:bg-wt-gray-light flex flex-col p-2 max-lg:absolute max-lg:bottom-0 sm:p-6 lg:p-0"
              >
                <div class="text-wt-gray-dark group-hover:text-wt-primary text-base">
                  {{ news.title }}
                </div>
                <div class="text-wt-gray-medium hidden space-x-1 text-xs lg:block">
                  <span>{{ news.site }}</span>
                  <span>●</span>
                  <span>{{ news.publishedDate | dateAgo }}</span>
                </div>
                <div class="text-wt-gray-medium hidden text-sm lg:block">{{ news.text | truncateWords: 25 }}</div>
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
          class="flex flex-col items-start gap-3 rounded-md pb-4 pl-2 pr-4 pt-2 max-lg:p-0 lg:flex-row"
        >
          <!-- image -->
          <div
            class="g-skeleton h-[255px] w-full min-w-[9rem] object-cover max-lg:m-auto sm:h-[275px] lg:h-28 lg:w-36 lg:pt-1"
          ></div>
          <div class="flex w-full flex-col gap-1 lg:block">
            <!-- title -->
            <div class="g-skeleton mb-1 hidden h-6 w-full lg:block"></div>
            <!-- creator -->
            <div class="g-skeleton mb-1 hidden h-6 w-full lg:block"></div>
            <div class="g-skeleton hidden h-20 w-full lg:block"></div>
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
  private readonly marketApiService = inject(MarketApiService);

  readonly initialNewsToDisplay = input(16);

  readonly searchData = input<{ newsType: NewsTypes; symbol?: string }>({ newsType: 'stocks', symbol: 'AAPL' });

  /**
   * will emit incremented number every time user scrolls near end
   */
  readonly displayMoreNotification = signal(0);

  private readonly newDisplay = 16;

  readonly marketStockNewsSignal = derivedFrom(
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
