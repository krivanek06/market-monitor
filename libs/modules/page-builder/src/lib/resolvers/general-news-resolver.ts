import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { MarketApiService } from '@market-monitor/api-client';
import { News } from '@market-monitor/api-types';

export const generalNewsResolver: ResolveFn<News[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const marketApiService = inject(MarketApiService);
  return marketApiService.getNews('general');
};
