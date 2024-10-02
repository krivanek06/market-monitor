import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserAccountEnum } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { LabelValue, ROUTES_MAIN } from '@mm/shared/data-access';
import { TabSelectControlComponent } from '@mm/shared/ui';

// used routes in this component
type MarketRoutes = ROUTES_MAIN.TOP_PERFORMERS | ROUTES_MAIN.ECONOMICS | ROUTES_MAIN.MARKET_CALENDAR | ROUTES_MAIN.NEWS;

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [RouterModule, TabSelectControlComponent, ReactiveFormsModule],
  template: `
    <app-tab-select-control
      class="hidden xl:block"
      [formControl]="currentRouteControl"
      [displayOptions]="marketTabsSignal()"
      screenLayoutSplit="LAYOUT_LG"
    />

    <section>
      <router-outlet />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  private readonly marketTabs: LabelValue<MarketRoutes>[] = [
    {
      label: 'Top Performers',
      value: ROUTES_MAIN.TOP_PERFORMERS,
    },
    {
      label: 'Economics',
      value: ROUTES_MAIN.ECONOMICS,
    },
    {
      label: 'Calendar',
      value: ROUTES_MAIN.MARKET_CALENDAR,
    },
    {
      label: 'News',
      value: ROUTES_MAIN.NEWS,
    },
  ];

  readonly marketTabsSignal = computed(() => {
    const userData = this.authenticationUserStoreService.state.getUserDataNormal();
    if (userData?.userAccountType === UserAccountEnum.DEMO_TRADING) {
      return [
        {
          label: 'Screener',
          value: ROUTES_MAIN.STOCK_SCREENER,
        },
        ...this.marketTabs,
      ];
    }
    return this.marketTabs;
  });

  readonly currentRouteControl = new FormControl<MarketRoutes>(ROUTES_MAIN.TOP_PERFORMERS, { nonNullable: true });

  ngOnInit(): void {
    // check if custom route is selected and set checkbox accordingly
    const lastSegment = this.router.url.split('/').pop()?.split('?')[0] ?? '';
    console.log('lastSegment', lastSegment);

    this.currentRouteControl.valueChanges.subscribe((value) => {
      console.log('currentRouteControl', value);
      this.router.navigate([value], { relativeTo: this.route });
    });

    // this.isCustomCheckedControl.patchValue(lastSegment === ROUTES_MARKET.CUSTOM);
    // this.isCustomCheckedControl.valueChanges.subscribe((value) => {
    //   if (value) {
    //     this.router.navigate([`${ROUTES_MAIN.MARKET}/${ROUTES_MARKET.CUSTOM}`]);
    //   } else {
    //     this.router.navigate([`${ROUTES_MAIN.MARKET}/${ROUTES_MARKET.OVERVIEW}`]);
    //   }
    // });
  }
}
