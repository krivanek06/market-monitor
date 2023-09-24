import { Injectable } from '@angular/core';
import { PortfolioGrowth, PortfolioRisk } from '@market-monitor/api-types';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioApiService {

  constructor() { }

  // TODO: calculation on backend
  getPortfolioRisk(): Observable<PortfolioRisk | null> {
    return of(null);
  }

  // TODO: calculation on backend
  getPortfolioGrowth(): Observable<PortfolioGrowth[]> {
    return of([]);
  }
}
