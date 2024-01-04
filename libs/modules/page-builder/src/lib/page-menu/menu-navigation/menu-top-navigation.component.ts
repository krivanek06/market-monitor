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
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks/features';
import { UserSettingsDialogComponent } from '@market-monitor/modules/user/features';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { FeatureAccessDirective } from '@market-monitor/shared/features/feature-access-directive';
import { HelpDialogComponent } from '@market-monitor/shared/features/help-dialog';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
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
    UserSettingsDialogComponent,
    MatDialogModule,
    HelpDialogComponent,
    StockSearchBasicCustomizedComponent,
  ],
  template: `
    <div class="w-full shadow-md mb-4">
      <nav class="w-full py-4 pl-8 pr-4 flex items-center gap-4 max-w-[1620px] mx-auto">
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
          *appFeatureAccess="'allowAccessGroups'"
          (click)="onNavClick(ROUTES_MAIN.GROUPS)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.GROUPS }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>group</mat-icon>
            <span>Groups</span>
          </div>
        </a>

        <!-- hall of fame -->
        <a
          *appFeatureAccess="'allowAccessHallOfFame'"
          (click)="onNavClick(ROUTES_MAIN.HALL_OF_FAME)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.HALL_OF_FAME }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>military_tech</mat-icon>
            <span>Hall Of Fame</span>
          </div>
        </a>

        <!-- screener -->
        <a
          *ngIf="userAccountTypeSignal() === 'Basic'"
          (click)="onNavClick(ROUTES_MAIN.STOCK_SCREENER)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.STOCK_SCREENER }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>search</mat-icon>
            <span>Screener</span>
          </div>
        </a>

        <!-- market -->
        <a
          (click)="onNavClick(ROUTES_MAIN.MARKET)"
          class="p-4 g-clickable-hover hover:bg-gray-100 rounded-md"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.MARKET }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>travel_explore</mat-icon>
            <span>Market</span>
          </div>
        </a>

        <div class="flex-1 flex justify-end">
          <!-- search -->
          <app-stock-search-basic-customized
            [showValueChange]="true"
            [showHint]="false"
            displayValue="symbol"
            class="w-[480px] scale-[0.8] -mb-4 -mr-10 hidden xl:block"
          />

          <div class="flex gap-1 items-center">
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
              <div
                class="min-w-[240px] flex flex-col top-[60px] scale-0 group-hover:scale-100 z-10 bg-wt-gray-light absolute transition-all duration-300 px-2 py-3 rounded-md ml-[-20px]"
              >
                <button
                  mat-button
                  class="mb-2 hover:bg-gray-100 hover:scale-95 duration-300 transition-all w-full"
                  (click)="onSettingClick()"
                >
                  <mat-icon>settings</mat-icon>
                  Settings
                </button>
                <button
                  mat-button
                  class="mb-2 hover:bg-gray-100 hover:scale-95 duration-300 transition-all w-full"
                  (click)="onHelpClick()"
                >
                  <mat-icon>help</mat-icon>
                  Help
                </button>
                <button
                  mat-button
                  class="hover:bg-gray-100 hover:scale-95 duration-300 transition-all w-full"
                  (click)="onLogOutClick()"
                >
                  <mat-icon>logout</mat-icon>
                  Log out
                </button>
              </div>
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

        a {
          padding-left: 8px;
          padding-right: 8px;
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
  userAccountTypeSignal = this.authenticationUserStoreService.state.getUserAccountType;

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
    this.dialog.open(UserSettingsDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onHelpClick() {
    this.dialog.open(HelpDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  async onLogOutClick() {
    this.router.navigate([ROUTES_MAIN.LOGIN]);
    this.authenticationService.signOut();
  }
}
