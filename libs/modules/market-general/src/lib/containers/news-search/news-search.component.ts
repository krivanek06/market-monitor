import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-client';
import { News, NewsAcceptableTypes, NewsTypes } from '@market-monitor/api-types';
import { FormMatInputWrapperComponent, InputSource } from '@market-monitor/shared-components';
import { DefaultImgDirective, RangeDirective, ScrollNearEndDirective } from '@market-monitor/shared-directives';
import { DateAgoPipe, TruncateWordsPipe } from '@market-monitor/shared-pipes';
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
  templateUrl: './news-search.component.html',
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
