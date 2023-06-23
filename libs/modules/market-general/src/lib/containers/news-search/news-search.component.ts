import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { NewsBodyComponent } from '../../components';

@Component({
  selector: 'app-news-search',
  standalone: true,
  imports: [CommonModule, NewsBodyComponent],
  templateUrl: './news-search.component.html',
  styleUrls: ['./news-search.component.scss'],
})
export class NewsSearchComponent {
  marketApiService = inject(MarketApiService);

  marketStockNews = toSignal(this.marketApiService.getNews('stocks'));
}
