import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-client';
import { FirebaseNewsTypes, News, firebaseNewsAcceptableTypes } from '@market-monitor/api-types';
import { FormMatInputWrapperComponent, InputSource } from '@market-monitor/shared-components';
import { RangeDirective, ScrollNearEndDirective } from '@market-monitor/shared-directives';
import { debounceTime, distinctUntilChanged, map, pairwise, startWith, switchMap, tap } from 'rxjs';
import { NewsBodyComponent } from '../../components';

@Component({
  selector: 'app-news-search',
  standalone: true,
  imports: [
    CommonModule,
    NewsBodyComponent,
    FormMatInputWrapperComponent,
    MatButtonModule,
    ReactiveFormsModule,
    RangeDirective,
    ScrollNearEndDirective,
  ],
  templateUrl: './news-search.component.html',
  styleUrls: ['./news-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSearchComponent {
  @Input() showForm = false;
  @Input() newDisplay = 16;
  @Input() set searchData(value: { newsType: FirebaseNewsTypes; symbol?: string }) {
    this.newSearchFormGroup.patchValue({
      newsType: value.newsType,
      symbol: value.symbol ?? '',
    });
  }
  marketApiService = inject(MarketApiService);

  newSearchFormGroup = new FormGroup({
    newsType: new FormControl<FirebaseNewsTypes>('stocks', { nonNullable: true }),
    symbol: new FormControl('', { nonNullable: true }),
  });

  get isNewsTypeGeneral(): boolean {
    return this.newSearchFormGroup.controls.newsType.value === 'general';
  }

  maximumNewsDisplayed = signal(this.newDisplay);
  showLoadingSignal = signal<boolean>(true);
  marketStockNewsSignal = toSignal<News[]>(
    this.newSearchFormGroup.valueChanges.pipe(
      startWith(this.newSearchFormGroup.getRawValue()),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        this.showLoadingSignal.set(true);
        this.maximumNewsDisplayed.set(this.newDisplay);
      }),
      pairwise(),
      map(([prev, curr]) => {
        // console.log('prev', prev, 'curr', curr);
        // reset symbol if newsType changed
        const symbol = (
          prev.newsType === curr.newsType ? (curr.newsType === 'crypto' ? `${curr.symbol}USD` : curr.symbol) : ''
        )?.toUpperCase();
        const newsType = curr.newsType ?? 'stocks';
        return [symbol, newsType] as [string, FirebaseNewsTypes];
      }),
      // save maybe modified symbol if newsType changed
      tap(([symbol, _]) => this.newSearchFormGroup.controls.symbol.setValue(symbol, { emitEvent: false })),
      // load news
      switchMap(([symbol, newsType]) => this.marketApiService.getNews(newsType, symbol)),
      // set loading to false
      tap(() => this.showLoadingSignal.set(false))
    )
  );

  /**
   * input source to display in select
   */
  newsTypesInputSource = firebaseNewsAcceptableTypes.map((d) => {
    const inputSource: InputSource<FirebaseNewsTypes> = {
      caption: d.toUpperCase(),
      value: d,
    };
    return inputSource;
  });

  constructor() {
    /**
     * TODO for some reason marketStockNewsSignal is not triggered on init
     */
    setTimeout(() => {
      this.newSearchFormGroup.setValue(this.newSearchFormGroup.getRawValue());
    }, 600);
  }

  onNearEndScroll(): void {
    this.maximumNewsDisplayed.set(this.maximumNewsDisplayed() + this.newDisplay);
  }
}
