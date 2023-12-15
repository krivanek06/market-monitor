import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';
import { stockDetailsResolver } from '@market-monitor/modules/page-builder';
import { LabelValue, ROUTES_STOCK_DETAILS, SCREEN_LAYOUT } from '@market-monitor/shared/data-access';
import { TabSelectControlComponent } from '@market-monitor/shared/ui';
import { DialogServiceModule } from '@market-monitor/shared/utils-client';

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
    <section>
      <div class="flex justify-end mb-6">
        <!-- main navigation -->
        <app-tab-select-control
          [formControl]="routesStockDetailsControl"
          [displayOptions]="routesStockDetails"
          [screenLayoutSplit]="screenLayoutSplit"
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
    { label: 'News', value: ROUTES_STOCK_DETAILS.NEWS },
    { label: 'Holders', value: ROUTES_STOCK_DETAILS.HOLDERS },
    { label: 'Trades', value: ROUTES_STOCK_DETAILS.TRADES },
  ];

  screenLayoutSplit = SCREEN_LAYOUT.LAYOUT_XL;

  constructor() {
    this.resolveUrl();

    // navigate to selected tab
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
    const slittedUrl = this.router.url.split('?');
    if (!slittedUrl[0]) {
      return;
    }
    const lastUrlSegment = slittedUrl[0].split('/').pop();
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
        title: 'Overview',
        loadComponent: () =>
          import('@market-monitor/modules/page-builder').then((m) => m.PageStockDetailsOverviewComponent),
      },
      {
        path: ROUTES_STOCK_DETAILS.HOLDERS,
        title: 'Holders',
        loadComponent: () =>
          import('@market-monitor/modules/page-builder').then((m) => m.PageStockDetailsHoldersComponent),
      },
      {
        path: ROUTES_STOCK_DETAILS.NEWS,
        title: 'News',
        loadComponent: () =>
          import('@market-monitor/modules/page-builder').then((m) => m.PageStockDetailsNewsComponent),
      },
      {
        path: ROUTES_STOCK_DETAILS.TRADES,
        title: 'Trades',
        loadComponent: () =>
          import('@market-monitor/modules/page-builder').then((m) => m.PageStockDetailsTradesComponent),
      },
      {
        path: ROUTES_STOCK_DETAILS.FINANCIALS,
        title: 'Financials',
        loadComponent: () =>
          import('@market-monitor/modules/page-builder').then((m) => m.PageStockDetailsFinancialsComponent),
      },
      {
        path: ROUTES_STOCK_DETAILS.RATIOS,
        title: 'Ratios',
        loadComponent: () =>
          import('@market-monitor/modules/page-builder').then((m) => m.PageStockDetailsRatiosComponent),
      },
    ],
  },
];
