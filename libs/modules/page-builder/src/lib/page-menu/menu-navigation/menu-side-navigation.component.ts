import { NgClass, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { UserAccountEnum } from '@mm/api-types';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
  hasUserAccess,
} from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, HelpDialogComponent } from '@mm/shared/ui';
import { UserSettingsDialogComponent } from '@mm/user/features';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-menu-side-navigation',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DefaultImgDirective,
    MatDividerModule,
    NgClass,
    TitleCasePipe,
    NgTemplateOutlet,
  ],
  template: `
    <div class="mb-2 flex items-center gap-2 px-3 py-6">
      <!-- avatar -->
      <img appDefaultImg [src]="userData()?.personal?.photoURL" alt="User Image" class="h-8 w-8 rounded-full" />
      <!-- name -->
      <div>{{ userData()?.personal?.displayName }}</div>
    </div>

    <!-- main navigation -->
    <div class="flex flex-col">
      <div class="mb-2 ml-4">Main</div>
      <ng-container *ngTemplateOutlet="navigationBlock; context: { navigation: sideNavigation().mainNavigation }" />
    </div>

    <div class="py-5">
      <mat-divider />
    </div>

    <!-- market navigation -->
    <div class="flex flex-col">
      <div class="mb-2 ml-4">Market</div>
      <ng-container *ngTemplateOutlet="navigationBlock; context: { navigation: sideNavigation().marketNavigation }" />
    </div>

    <!-- navigation helper -->
    <ng-template #navigationBlock let-navigation="navigation">
      <div class="grid gap-2">
        @for (main of navigation; track main.path) {
          @if (!main.hidden) {
            <a
              [routerLink]="main.path"
              routerLinkActive="bg-wt-gray-light-strong text-wt-primary"
              class="hover:bg-wt-gray-light-strong text-wt-gray-dark flex h-12 max-w-[90%] items-center gap-3 rounded-xl"
              [ngClass]="{
                'pl-5': selectedNavigationPath() !== main.path,
              }"
            >
              @if (selectedNavigationPath() === main.path) {
                <div class="bg-wt-primary h-full w-3"></div>
              }
              <mat-icon>{{ main.icon }}</mat-icon>
              <div class="text-base">{{ main.title | titlecase }}</div>
            </a>
          }
        }
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSideNavigationComponent {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationAccountService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly dialog = inject(MatDialog);

  readonly userData = this.authenticationUserStoreService.state.getUserDataNormal;

  readonly sideNavigation = computed(() => {
    const userData = this.authenticationUserStoreService.state.getUserData();
    const data = {
      mainNavigation: [
        {
          path: ROUTES_MAIN.DASHBOARD,
          title: 'Dashboard',
          icon: 'dashboard',
        },
        {
          path: ROUTES_MAIN.WATCHLIST,
          title: 'Watchlist',
          icon: 'monitoring',
        },
        {
          path: ROUTES_MAIN.TRADING,
          title: 'Trading',
          icon: 'attach_money',
        },
        {
          path: ROUTES_MAIN.GROUPS,
          title: 'Groups',
          icon: 'group',
          hidden: !hasUserAccess(userData, UserAccountEnum.DEMO_TRADING),
        },
        {
          path: ROUTES_MAIN.HALL_OF_FAME,
          title: 'Hall Of Fame',
          icon: 'military_tech',
          hidden: !hasUserAccess(userData, UserAccountEnum.DEMO_TRADING),
        },
        {
          path: ROUTES_MAIN.COMPARE_USERS,
          title: 'Compare Users',
          icon: 'diversity_3',
          hidden: !hasUserAccess(userData, UserAccountEnum.DEMO_TRADING),
        },
        {
          path: ROUTES_MAIN.TRADING_SIMULATOR,
          title: 'Trading Simulator',
          icon: 'sports_esports',
        },
      ],
      marketNavigation: [
        {
          path: ROUTES_MAIN.STOCK_SCREENER,
          title: 'Screener',
          icon: 'query_stats',
        },
        {
          path: ROUTES_MAIN.TOP_PERFORMERS,
          title: 'Performers',
          icon: 'travel_explore',
        },
        {
          path: ROUTES_MAIN.ECONOMICS,
          title: 'Economics',
          icon: 'storefront',
        },
        {
          path: ROUTES_MAIN.MARKET_CALENDAR,
          title: 'Calendar',
          icon: 'calendar_month',
        },
        {
          path: ROUTES_MAIN.NEWS,
          title: 'News',
          icon: 'newspaper',
        },
      ],
    } as const;
    return data;
  });

  readonly selectedNavigationPath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationStart),
      map((event) => event.url),
      startWith(this.router.url),
      map((url) => url.replace('/', '') as string),
    ),
    { initialValue: '' },
  );

  async onLogout() {
    await this.router.navigate([ROUTES_MAIN.LOGIN]);
    this.authenticationService.signOut();
  }

  onSettings() {
    this.dialog.open(UserSettingsDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onHelp() {
    this.dialog.open(HelpDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }
}
