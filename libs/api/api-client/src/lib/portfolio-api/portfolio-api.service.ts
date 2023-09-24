import { Injectable } from '@angular/core';
import { PortfolioGrowth, PortfolioHoldingsData, PortfolioRisk } from '@market-monitor/api-types';
import { Observable, of } from 'rxjs';
import { MarketApiService } from '../market-api/market-api.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  constructor(private marketApiService: MarketApiService) {}

  getPortfolioHoldingsDataByUser(userId: string): Observable<PortfolioHoldingsData[]> {
    return of([]);
  }

  // TODO: calculation on backend
  getPortfolioRiskByUser(userId: string): Observable<PortfolioRisk | null> {
    return of(null);
  }

  // TODO: calculation on backend
  getPortfolioGrowthByUser(userId: string): Observable<PortfolioGrowth[]> {
    return of([]);
  }
}
