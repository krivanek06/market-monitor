import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { SettingsDialogComponent } from '@market-monitor/modules/authentication/features';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { FeatureAccessDirective } from '@market-monitor/shared/features';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-menu-top-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    DefaultImgDirective,
    MatButtonModule,
    FeatureAccessDirective,
    SettingsDialogComponent,
    MatDialogModule,
  ],
  template: `
    <div class="w-full shadow-md mb-4">
      <nav class="w-full py-4 pl-8 pr-12 flex items-center gap-4 max-w-[1620px] mx-auto">
        <!-- dashboard -->
        <a
          (click)="onNavClick(ROUTES_MAIN.DASHBOARD)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.DASHBOARD }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </div>
        </a>

        <!-- watchlist -->
        <a
          (click)="onNavClick(ROUTES_MAIN.WATCHLIST)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.WATCHLIST }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>monitoring</mat-icon>
            <span>Watchlist</span>
          </div>
        </a>

        <!-- trading -->
        <a
          (click)="onNavClick(ROUTES_MAIN.TRADING)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.TRADING }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>attach_money</mat-icon>
            <span>Trading</span>
          </div>
        </a>

        <!-- groups -->
        <a
          *appFeatureAccess="'groupAllowAccess'"
          (click)="onNavClick(ROUTES_MAIN.GROUPS)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.GROUPS }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>group</mat-icon>
            <span>Groups</span>
          </div>
        </a>

        <!-- market dropdown on smaller screen -->
        <div class="p-4 hover:bg-gray-100 rounded-md block 2xl:hidden group relative">
          <div class="gap-2 flex items-center">
            <mat-icon>expand_more</mat-icon>
            <span>Other</span>
          </div>

          <div class="w-[200px] c-scale top-[60px] -left-5">
            <button mat-button class="mb-2 c-scale__item" (click)="onNavClick(ROUTES_MAIN.SEARCH)">
              <mat-icon>search</mat-icon>
              Search
            </button>
            <button mat-button class="mb-2 c-scale__item" (click)="onNavClick(ROUTES_MAIN.TOP_PERFORMERS)">
              <mat-icon>travel_explore</mat-icon>
              Performers
            </button>
            <button mat-button class="mb-2 c-scale__item" (click)="onNavClick(ROUTES_MAIN.MARKET)">
              <mat-icon>storefront</mat-icon>
              Market
            </button>
            <button mat-button class="c-scale__item" (click)="onNavClick(ROUTES_MAIN.MARKET_CALENDAR)">
              <mat-icon>calendar_month</mat-icon>
              Calendar
            </button>
          </div>
        </div>

        <!-- search -->
        <a
          (click)="onNavClick(ROUTES_MAIN.SEARCH)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md hidden 2xl:block"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.SEARCH }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>search</mat-icon>
            <span>Search</span>
          </div>
        </a>

        <!-- performers -->
        <a
          (click)="onNavClick(ROUTES_MAIN.TOP_PERFORMERS)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md hidden 2xl:block"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.TOP_PERFORMERS }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>travel_explore</mat-icon>
            <span>Performers</span>
          </div>
        </a>

        <!-- market -->
        <a
          (click)="onNavClick(ROUTES_MAIN.MARKET)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md hidden 2xl:block"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.MARKET }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>storefront</mat-icon>
            <span>Market</span>
          </div>
        </a>

        <!-- calendar -->
        <a
          (click)="onNavClick(ROUTES_MAIN.MARKET_CALENDAR)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md hidden 2xl:block"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.MARKET_CALENDAR }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>calendar_month</mat-icon>
            <span>Calendar</span>
          </div>
        </a>

        <div class="flex flex-1 justify-end">
          <!-- display logged in person -->
          <div *ngIf="userDataSignal() as userDataSignal" class="group p-4 relative">
            <div class="flex items-center gap-3">
              <img
                appDefaultImg
                class="w-8 h-8 rounded-full"
                [src]="userDataSignal.personal.photoURL"
                [alt]="userDataSignal.personal.displayName"
              />
              <span>{{ userDataSignal.personal.displayName }}</span>
            </div>

            <!-- menu -->
            <div class="min-w-[220px] flex flex-col top-[60px] c-scale">
              <button mat-button class="mb-2 c-scale__item" (click)="onSettingClick()">
                <mat-icon>settings</mat-icon>
                Settings
              </button>
              <button mat-button class="mb-2 c-scale__item" (click)="onHelpClick()">
                <mat-icon>help</mat-icon>
                Help
              </button>
              <button mat-button class="c-scale__item" (click)="onLogOutClick()">
                <mat-icon>logout</mat-icon>
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;

        .c-scale {
          @apply scale-0 group-hover:scale-100 z-10 bg-wt-gray-light absolute transition-all duration-300 px-2 py-3 rounded-md;
        }

        .c-scale__item {
          @apply hover:bg-gray-100 hover:scale-95 duration-300 transition-all w-full;
        }

        a {
          max-width: 150px;

          &.c-active {
            border-bottom: 2px solid var(--primary) !important;
            > * {
              color: var(--primary) !important;
            }
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuTopNavigationComponent implements OnInit {
  private router = inject(Router);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private authenticationService = inject(AuthenticationAccountService);
  private dialog = inject(MatDialog);

  userDataSignal = this.authenticationUserStoreService.state.userData;

  ROUTES_MAIN = ROUTES_MAIN;
  activeLinkSignal = signal<ROUTES_MAIN>(ROUTES_MAIN.DASHBOARD);

  ngOnInit(): void {
    // check if url is different than activeLinkSignal
    const url = this.router.url.replace('/', '') as ROUTES_MAIN;
    this.activeLinkSignal.set(url);
  }

  onNavClick(navigation: ROUTES_MAIN) {
    this.activeLinkSignal.set(navigation);
    this.router.navigate([navigation]);
  }

  onSettingClick() {
    this.dialog.open(SettingsDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onHelpClick() {}

  async onLogOutClick() {
    this.router.navigate([ROUTES_MAIN.LOGIN]);
    this.authenticationService.signOut();
  }
}
