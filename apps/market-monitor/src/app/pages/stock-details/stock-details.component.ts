import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';
import { stockDetailsResolver } from '@market-monitor/modules/page-builder';
import { LabelValue, TabSelectControlComponent } from '@market-monitor/shared-components';
import { DialogServiceModule } from '@market-monitor/shared-utils-client';
import { ROUTES_STOCK_DETAILS } from '../../routes.model';
import { StockDetailsFinancialsComponent } from './subpages/stock-details-financials.component';
import { StockDetailsHoldersComponent } from './subpages/stock-details-holders.component';
import { StockDetailsOverviewComponent } from './subpages/stock-details-overview.component';
import { StockDetailsRatiosComponent } from './subpages/stock-details-ratios.component';
import { StockDetailsTradesComponent } from './subpages/stock-details-trades.component';

@Component({
  selector: 'app-stock-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TabSelectControlComponent,
    DialogServiceModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <section class="g-screen-size-default">
      <div class="flex justify-between mb-6 items-center">
        <div>
          <button type="button" mat-stroked-button class="min-w-[120px]" (click)="onHomeClick()">
            <mat-icon>home</mat-icon>
            Home
          </button>
        </div>

        <!-- main navigation -->
        <app-tab-select-control
          [formControl]="routesStockDetailsControl"
          [displayOptions]="routesStockDetails"
        ></app-tab-select-control>
      </div>

      <router-outlet></router-outlet>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        @apply mt-6 block;
      }
    `,
  ],
})
export class StockDetailsComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  routesStockDetailsControl = new FormControl<string>(ROUTES_STOCK_DETAILS.OVERVIEW);
  routesStockDetails: LabelValue<string>[] = [
    { label: 'Overview', value: ROUTES_STOCK_DETAILS.OVERVIEW },
    { label: 'Financials', value: ROUTES_STOCK_DETAILS.FINANCIALS },
    { label: 'Ratios', value: ROUTES_STOCK_DETAILS.RATIOS },
    { label: 'Holders', value: ROUTES_STOCK_DETAILS.HOLDERS },
    { label: 'Trades', value: ROUTES_STOCK_DETAILS.TRADES },
  ];

  constructor() {
    this.resolveUrl();

    this.routesStockDetailsControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.router.navigate([value], { relativeTo: this.route });
    });
  }

  onHomeClick(): void {
    this.router.navigate(['']);
  }

  /**
   * may happen that url is different than default value in routesStockDetailsControl
   */
  private resolveUrl(): void {
    const lastUrlSegment = this.router.url.split('?')[0].split('/').pop();
    if (lastUrlSegment) {
      this.routesStockDetailsControl.patchValue(lastUrlSegment);
    }
  }
}

export const route: Routes = [
  {
    path: '',
    component: StockDetailsComponent,
    resolve: {
      stockDetails: stockDetailsResolver,
    },
    children: [
      {
        path: '',
        redirectTo: ROUTES_STOCK_DETAILS.OVERVIEW,
        pathMatch: 'full',
      },
      {
        path: ROUTES_STOCK_DETAILS.OVERVIEW,
        component: StockDetailsOverviewComponent,
      },
      {
        path: ROUTES_STOCK_DETAILS.HOLDERS,
        component: StockDetailsHoldersComponent,
      },
      {
        path: ROUTES_STOCK_DETAILS.TRADES,
        component: StockDetailsTradesComponent,
      },
      {
        path: ROUTES_STOCK_DETAILS.FINANCIALS,
        component: StockDetailsFinancialsComponent,
      },
      {
        path: ROUTES_STOCK_DETAILS.RATIOS,
        component: StockDetailsRatiosComponent,
      },
    ],
  },
];
