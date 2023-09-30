import { Injectable } from '@angular/core';
import { PortfolioRisk, PortfolioTransaction } from '@market-monitor/api-types';
import { Observable, of } from 'rxjs';
import { MarketApiService } from '../market-api/market-api.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  constructor(private marketApiService: MarketApiService) {}

  // todo load all transaction from user and calculate portfolio
  getPortfolioTransactionsByUser(userId: string): Observable<PortfolioTransaction[]> {
    return of([]);
  }

  // TODO: calculation on backend
  getPortfolioRiskByUser(userId: string): Observable<PortfolioRisk | null> {
    return of(null);
  }
}
