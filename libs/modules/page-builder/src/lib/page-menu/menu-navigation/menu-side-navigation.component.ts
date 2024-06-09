import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
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

@Component({
  selector: 'app-menu-side-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    UserSettingsDialogComponent,
    HelpDialogComponent,
    MatDialogModule,
    DefaultImgDirective,
    MatDividerModule,
  ],
  template: `
    <div class="mb-2 flex items-center gap-2 p-6">
      <!-- avatar -->
      <img appDefaultImg [src]="userData()?.personal?.photoURL" alt="User Image" class="h-8 w-8 rounded-full" />
      <!-- name -->
      <div>{{ userData()?.personal?.displayName }}</div>
    </div>

    <!-- main navigation -->
    <div class="flex flex-col">
      <div class="mb-2 ml-4">Main</div>
      <ng-container
        *ngTemplateOutlet="navigationBlock; context: { navigation: sideNavigation().mainNavigation }"
      ></ng-container>
    </div>

    <div class="py-5">
      <mat-divider />
    </div>

    <!-- market navigation -->
    <div class="flex flex-col">
      <div class="mb-2 ml-4">Market</div>
      <ng-container
        *ngTemplateOutlet="navigationBlock; context: { navigation: sideNavigation().marketNavigation }"
      ></ng-container>
    </div>

    <div class="py-5">
      <mat-divider />
    </div>

    <!-- other navigation -->
    <div class="mb-8 flex flex-col">
      <div class="mb-2 ml-4">Other</div>

      <!-- settings -->
      <div class="grid gap-2">
        <a (click)="onSettings()" class="c-link">
          <mat-icon>settings</mat-icon>
          <div class="text-base">Settings</div>
        </a>
      </div>

      <!-- help -->
      <div class="grid gap-2">
        <a (click)="onHelp()" class="c-link">
          <mat-icon>help</mat-icon>
          <div class="text-base">Help</div>
        </a>
      </div>

      <!-- logout -->
      <div class="grid gap-2">
        <a (click)="onLogout()" class="c-link">
          <mat-icon>logout</mat-icon>
          <div class="text-base">Logout</div>
        </a>
      </div>
    </div>

    <!-- navigation helper -->
    <ng-template #navigationBlock let-navigation="navigation">
      <div class="grid gap-2">
        @for (main of navigation; track main.path) {
          <a
            *ngIf="!main.hidden"
            [routerLink]="main.path"
            routerLinkActive="bg-wt-gray-light-strong text-wt-primary"
            (click)="onNavigationClick(main.path)"
            class="hover:bg-wt-gray-light-strong flex h-12 max-w-[90%] items-center gap-3 rounded-e-xl"
            [ngClass]="{
              'pl-5': selectedNavigationPath() !== main.path,
            }"
          >
            <div *ngIf="selectedNavigationPath() === main.path" class="bg-wt-primary h-full w-3"></div>
            <mat-icon>{{ main.icon }}</mat-icon>
            <div class="text-base">{{ main.title | titlecase }}</div>
          </a>
        }
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }

    .c-link {
      @apply hover:bg-wt-gray-light-strong flex h-12 max-w-[90%] cursor-pointer items-center gap-3 rounded-e-xl pl-5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSideNavigationComponent implements OnInit {
  private router = inject(Router);
  private authenticationService = inject(AuthenticationAccountService);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private dialog = inject(MatDialog);

  userData = this.authenticationUserStoreService.state.getUserDataNormal;

  sideNavigation = computed(() => {
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
      ],
      marketNavigation: [
        // {
        //   path: `${ROUTES_MAIN.MARKET}/${ROUTES_MAIN.SEARCH}`,
        //   title: 'Search',
        //   icon: 'search',
        // },
        {
          path: `${ROUTES_MAIN.MARKET}/${ROUTES_MAIN.STOCK_SCREENER}`,
          title: 'Screener',
          icon: 'query_stats',
        },
        {
          path: `${ROUTES_MAIN.MARKET}/${ROUTES_MAIN.TOP_PERFORMERS}`,
          title: 'Performers',
          icon: 'travel_explore',
        },
        {
          path: `${ROUTES_MAIN.MARKET}/${ROUTES_MAIN.ECONOMICS}`,
          title: 'Economics',
          icon: 'storefront',
        },
        {
          path: `${ROUTES_MAIN.MARKET}/${ROUTES_MAIN.MARKET_CALENDAR}`,
          title: 'Calendar',
          icon: 'calendar_month',
        },
        {
          path: `${ROUTES_MAIN.MARKET}/${ROUTES_MAIN.NEWS}`,
          title: 'News',
          icon: 'newspaper',
        },
      ],
    } as const;
    return data;
  });

  selectedNavigationPath = signal('');

  ngOnInit(): void {
    const selectedNavigationPath = this.router.url.split('/')[1]; // ['', 'dashboard']
    this.selectedNavigationPath.set(selectedNavigationPath);
  }

  onNavigationClick(path: string) {
    console.log('path', path);
    this.selectedNavigationPath.set(path);
  }

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
