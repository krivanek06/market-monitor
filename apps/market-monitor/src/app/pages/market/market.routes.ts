import { Routes } from '@angular/router';
import { ROUTES_MARKET } from '../../routes.model';
import { MarketCustomComponent } from './market-custom/market-custom.component';
import { MarketOverviewComponent } from './market-overview/market-overview.component';
import { MarketComponent } from './market.component';

export const route: Routes = [
  {
    path: '',
    component: MarketComponent,
    children: [
      {
        path: '',
        redirectTo: ROUTES_MARKET.OVERVIEW,
        pathMatch: 'full',
      },
      {
        path: ROUTES_MARKET.OVERVIEW,
        component: MarketOverviewComponent,
      },
      {
        path: ROUTES_MARKET.CUSTOM,
        component: MarketCustomComponent,
      },
    ],
  },
];
