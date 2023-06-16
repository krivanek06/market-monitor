import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENDPOINT_FUNCTION_URL, MarketOverviewResponse } from '@market-monitor/shared-types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENDPOINT_FUNCTION_URL) private readonly endpointFunctions: string
  ) {}

  getMarketOverview(): Observable<MarketOverviewResponse> {
    return this.http.get<MarketOverviewResponse>(`${this.endpointFunctions}/getmarketoverview`);
  }
}
