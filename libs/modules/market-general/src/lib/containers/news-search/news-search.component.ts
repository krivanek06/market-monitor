import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { FirebaseNewsTypes, News, firebaseNewsAcceptableTypes } from '@market-monitor/api-types';
import { FormMatInputWrapperComponent, InputSource } from '@market-monitor/shared-components';
import { NewsBodyComponent } from '../../components';
@Component({
  selector: 'app-news-search',
  standalone: true,
  imports: [CommonModule, NewsBodyComponent, FormMatInputWrapperComponent, MatButtonModule, ReactiveFormsModule],
  templateUrl: './news-search.component.html',
  styleUrls: ['./news-search.component.scss'],
})
export class NewsSearchComponent {
  marketApiService = inject(MarketApiService);
  marketStockNewsSignal = signal<News[]>([]);

  newSearchFormGroup = new FormGroup({
    newsType: new FormControl<FirebaseNewsTypes>('stocks', { nonNullable: true }),
    symbol: new FormControl('', { nonNullable: true }),
  });

  newsTypesInputSource = firebaseNewsAcceptableTypes.map((d) => {
    const inputSource: InputSource<FirebaseNewsTypes> = {
      caption: d.toUpperCase(),
      value: d,
    };
    return inputSource;
  });

  constructor() {
    this.newSearchFormGroup.valueChanges.subscribe((d) => {
      console.log('newSearchFormGroup', d);
    });

    // load news with initial data from newSearchFormGroup
    this.onFormSubmit();
  }

  onFormSubmit(): void {
    console.log('onFormSubmit');
    const controls = this.newSearchFormGroup.getRawValue();
    this.marketApiService.getNews(controls.newsType, controls.symbol).subscribe((res) => {
      console.log('new news', res);
      this.marketStockNewsSignal.set(res);
    });
  }
}
