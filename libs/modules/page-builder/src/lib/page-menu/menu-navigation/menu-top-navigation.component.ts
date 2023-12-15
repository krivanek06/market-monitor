import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { DefaultImgDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-menu-top-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    DefaultImgDirective,
    MatButtonModule,
  ],
  template: `
    <div class="shadow-md pt-5 px-8 mb-4">
      <div class="flex justify-between max-w-[1620px] mx-auto">
        <nav mat-tab-nav-bar [tabPanel]="tabPanel" class="flex-1">
          <!-- dashboard -->
          <a
            mat-tab-link
            (click)="onNavClick(ROUTES_MAIN.DASHBOARD)"
            [active]="activeLinkSignal() == ROUTES_MAIN.DASHBOARD"
          >
            <div class="gap-2 flex items-center">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </div>
          </a>

          <!-- watchlist -->
          <a
            mat-tab-link
            (click)="onNavClick(ROUTES_MAIN.WATCHLIST)"
            [active]="activeLinkSignal() == ROUTES_MAIN.WATCHLIST"
          >
            <div class="gap-2 flex items-center">
              <mat-icon>monitoring</mat-icon>
              <span>Watchlist</span>
            </div>
          </a>

          <!-- trading -->
          <a
            mat-tab-link
            (click)="onNavClick(ROUTES_MAIN.TRADING)"
            [active]="activeLinkSignal() == ROUTES_MAIN.TRADING"
          >
            <div class="gap-2 flex items-center">
              <mat-icon>attach_money</mat-icon>
              <span>Trading</span>
            </div>
          </a>

          <!-- groups -->
          <a mat-tab-link (click)="onNavClick(ROUTES_MAIN.GROUPS)" [active]="activeLinkSignal() == ROUTES_MAIN.GROUPS">
            <div class="gap-2 flex items-center">
              <mat-icon>group</mat-icon>
              <span>Groups</span>
            </div>
          </a>

          <!-- search -->
          <a mat-tab-link (click)="onNavClick(ROUTES_MAIN.SEARCH)" [active]="activeLinkSignal() == ROUTES_MAIN.SEARCH">
            <div class="gap-2 flex items-center">
              <mat-icon>search</mat-icon>
              <span>Search</span>
            </div>
          </a>

          <!-- performers -->
          <a
            mat-tab-link
            (click)="onNavClick(ROUTES_MAIN.TOP_PERFORMERS)"
            [active]="activeLinkSignal() == ROUTES_MAIN.TOP_PERFORMERS"
          >
            <div class="gap-2 flex items-center">
              <mat-icon>travel_explore</mat-icon>
              <span>Performers</span>
            </div>
          </a>

          <!-- market -->
          <a mat-tab-link (click)="onNavClick(ROUTES_MAIN.MARKET)" [active]="activeLinkSignal() == ROUTES_MAIN.MARKET">
            <div class="gap-2 flex items-center">
              <mat-icon>storefront</mat-icon>
              <span>Market</span>
            </div>
          </a>

          <!-- calendar -->
          <a
            mat-tab-link
            (click)="onNavClick(ROUTES_MAIN.MARKET_CALENDAR)"
            [active]="activeLinkSignal() == ROUTES_MAIN.MARKET_CALENDAR"
          >
            <div class="gap-2 flex items-center">
              <mat-icon>calendar_month</mat-icon>
              <span>Calendar</span>
            </div>
          </a>
        </nav>

        <div>
          <!-- display logged in person -->
          <button mat-button [matMenuTriggerFor]="personMenu">
            <div class="flex items-center gap-3">
              <img
                appDefaultImg
                class="w-8 h-8 rounded-full"
                [src]="userDataSignal().personal.photoURL"
                [alt]="userDataSignal().personal.displayName"
              />
              <span>{{ userDataSignal().personal.displayName }}</span>
            </div>
          </button>

          <!-- menu -->
          <mat-menu #personMenu="matMenu" [hasBackdrop]="false" class="min-w-[180px]">
            <button mat-menu-item class="mb-2" (click)="onSettingClick()">
              <mat-icon>settings</mat-icon>
              Settings
            </button>
            <button mat-menu-item class="mb-2" (click)="onHelpClick()">
              <mat-icon>help</mat-icon>
              Help
            </button>
            <button mat-menu-item (click)="onLogOutClick()">
              <mat-icon>logout</mat-icon>
              Log out
            </button>
          </mat-menu>
        </div>
      </div>
    </div>

    <!-- tab panel - don't remove, console errors -->
    <mat-tab-nav-panel #tabPanel class="hidden"> </mat-tab-nav-panel>
  `,
  styles: `
    :host {
      display: block;

      a {
        max-width: 150px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuTopNavigationComponent {
  private router = inject(Router);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private authenticationService = inject(AuthenticationAccountService);

  userDataSignal = this.authenticationUserStoreService.state.getUserData;

  ROUTES_MAIN = ROUTES_MAIN;
  activeLinkSignal = signal<ROUTES_MAIN>(ROUTES_MAIN.DASHBOARD);

  onNavClick(navigation: ROUTES_MAIN) {
    this.activeLinkSignal.set(navigation);
    this.router.navigate([navigation]);
  }

  onSettingClick() {}

  onHelpClick() {}

  async onLogOutClick() {
    await this.authenticationService.signOut();
    this.router.navigate([ROUTES_MAIN.LOGIN]);
  }
}
