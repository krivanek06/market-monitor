import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FirebaseNewsTypes, MarketTopPerformanceOverviewResponse, News } from '@market-monitor/api-types';
import { Observable } from 'rxjs';
import { ENDPOINT_FUNCTION_URL } from './api-url.token';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENDPOINT_FUNCTION_URL) private readonly endpointFunctions: string
  ) {}

  getMarketOverview(): Observable<MarketTopPerformanceOverviewResponse> {
    return this.http.get<MarketTopPerformanceOverviewResponse>(`${this.endpointFunctions}/getmarketoverview`);
  }

  getNews(newsType: FirebaseNewsTypes, symbol: string = ''): Observable<News[]> {
    return this.http.get<News[]>(`${this.endpointFunctions}/getmarketnews?news_types=${newsType}&symbol=${symbol}`);
  }
}
