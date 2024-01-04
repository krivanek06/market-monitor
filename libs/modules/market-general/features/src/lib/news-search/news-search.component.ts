import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-client';
import { News, NewsAcceptableTypes, NewsTypes } from '@market-monitor/api-types';
import { InputSource } from '@market-monitor/shared/data-access';
import {
  DateAgoPipe,
  DefaultImgDirective,
  FormMatInputWrapperComponent,
  RangeDirective,
  ScrollNearEndDirective,
  TruncateWordsPipe,
} from '@market-monitor/shared/ui';
import { map, pairwise, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-news-search',
  standalone: true,
  imports: [
    CommonModule,
    FormMatInputWrapperComponent,
    MatButtonModule,
    ReactiveFormsModule,
    RangeDirective,
    ScrollNearEndDirective,
    DateAgoPipe,
    TruncateWordsPipe,
    DefaultImgDirective,
  ],
  template: `<form *ngIf="showForm" class="flex items-center gap-3 mb-2" [formGroup]="newSearchFormGroup">
      <!-- news type -->
      <app-form-mat-input-wrapper
        inputCaption="Select News Type"
        formControlName="newsType"
        inputType="SELECT"
        [inputSource]="newsTypesInputSource"
      ></app-form-mat-input-wrapper>

      <!-- symbol -->
      <app-form-mat-input-wrapper
        *ngIf="!isNewsTypeGeneral"
        formControlName="symbol"
        inputCaption="Enter Symbol"
      ></app-form-mat-input-wrapper>
    </form>

    <!-- loaded news -->
    <div
      *ngIf="!loadingSignal(); else showSkeleton"
      appScrollNearEnd
      (nearEnd)="onNearEndScroll()"
      class="grid grid-cols-1 md:grid-cols-2"
    >
      <article
        *ngFor="let news of marketStockNewsSignal()?.slice(0, maximumNewsDisplayed())"
        class="inline-block m-2 transition-all duration-300 group hover:scale-95"
      >
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
    </div>

    <!-- loading screen -->
    <ng-template #showSkeleton>
      <div class="columns-1 md:columns-2">
        <div
          *ngRange="initialNewsToDisplay"
          class="flex flex-col items-start gap-3 pt-2 pb-4 pl-2 pr-4 rounded-md max-lg:p-0 lg:flex-row"
        >
          <!-- image -->
          <div
            class="h-[255px] sm:h-[275px] object-cover lg:h-28 lg:w-36 min-w-[9rem] max-lg:m-auto w-full lg:pt-1 g-skeleton"
          ></div>
          <div class="flex flex-col w-full gap-1 lg:block">
            <!-- title -->
            <div class="hidden w-full h-6 g-skeleton lg:block"></div>
            <!-- creator -->
            <div class="hidden w-full h-6 g-skeleton lg:block"></div>
            <div class="hidden w-full h-20 lg:block g-skeleton"></div>
          </div>
        </div>
      </div>
    </ng-template> `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSearchComponent {
  @Input() showForm = false;
  @Input() initialNewsToDisplay = 16;
  @Input({ required: true }) set searchData(value: { newsType: NewsTypes; symbol?: string }) {
    this.newSearchFormGroup.patchValue({
      newsType: value.newsType,
      symbol: value.symbol ?? '',
    });
  }

  marketApiService = inject(MarketApiService);

  newSearchFormGroup = new FormGroup({
    newsType: new FormControl<NewsTypes>('stocks', { nonNullable: true }),
    symbol: new FormControl('', { nonNullable: true }),
  });

  get isNewsTypeGeneral(): boolean {
    return this.newSearchFormGroup.controls.newsType.value === 'general';
  }

  private newDisplay = 16;

  maximumNewsDisplayed = signal(this.initialNewsToDisplay);
  loadingSignal = signal(false);
  marketStockNewsSignal = toSignal<News[]>(
    this.newSearchFormGroup.valueChanges.pipe(
      startWith(this.newSearchFormGroup.getRawValue()),
      tap(() => {
        this.loadingSignal.set(true);
        this.maximumNewsDisplayed.set(this.initialNewsToDisplay);
      }),
      pairwise(),
      map(([prev, curr]) => {
        // console.log('prev', prev, 'curr', curr);
        // reset symbol if newsType changed
        // example previously it was 'stocks', now it is 'forex', we want to reset the symbol then
        const symbol = (
          prev.newsType === curr.newsType ? (curr.newsType === 'crypto' ? `${curr.symbol}USD` : curr.symbol) : ''
        )?.toUpperCase();
        const newsType = curr.newsType ?? 'stocks';
        return [symbol, newsType] as [string, NewsTypes];
      }),
      // save maybe modified symbol if newsType changed
      tap(([symbol, _]) => this.newSearchFormGroup.controls.symbol.setValue(symbol, { emitEvent: false })),
      // load news
      switchMap(([symbol, newsType]) => this.marketApiService.getNews(newsType, symbol)),
      tap(() => this.loadingSignal.set(false)),
    ),
  );

  /**
   * input source to display in select
   */
  newsTypesInputSource = NewsAcceptableTypes.map((d) => {
    const inputSource: InputSource<NewsTypes> = {
      caption: d.toUpperCase(),
      value: d,
    };
    return inputSource;
  });

  onNearEndScroll(): void {
    this.maximumNewsDisplayed.set(this.maximumNewsDisplayed() + this.newDisplay);
  }
}
