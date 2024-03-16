import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { UserAccountTypeDirective } from '@market-monitor/modules/authentication/features/feature-access-directive';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks/features';
import { UserSettingsDialogComponent } from '@market-monitor/modules/user/features';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import {
  GenericDialogComponent,
  GenericDialogComponentData,
  SCREEN_DIALOGS,
} from '@market-monitor/shared/features/dialog-manager';
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
    UserAccountTypeDirective,
    UserSettingsDialogComponent,
    MatDialogModule,
    HelpDialogComponent,
    StockSearchBasicCustomizedComponent,
    GenericDialogComponent,
  ],
  template: `
    <div class="w-full shadow-md p-2">
      <nav class="w-full pl-3 sm:pl-8 sm:pr-4 flex items-center gap-4 max-w-[1620px] mx-auto pb-1">
        <!-- hide menu button -->
        <div class="block xl:hidden">
          <button type="button" mat-icon-button (click)="onMenuClick()">
            <mat-icon>menu</mat-icon>
          </button>
        </div>

        <!-- dashboard -->
        <a
          (click)="onNavClick(ROUTES_MAIN.DASHBOARD)"
          class="g-clickable-hover"
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
          class="g-clickable-hover"
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
          class="g-clickable-hover"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.TRADING }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>attach_money</mat-icon>
            <span>Trading</span>
          </div>
        </a>

        <!-- groups -->
        <a
          *appUserAccountType="'DEMO_TRADING'"
          (click)="onNavClick(ROUTES_MAIN.GROUPS)"
          class="g-clickable-hover"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.GROUPS }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>group</mat-icon>
            <span>Groups</span>
          </div>
        </a>

        <!-- hall of fame -->
        <a
          *appUserAccountType="'DEMO_TRADING'"
          (click)="onNavClick(ROUTES_MAIN.HALL_OF_FAME)"
          class="g-clickable-hover"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.HALL_OF_FAME }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>military_tech</mat-icon>
            <span>Hall Of Fame</span>
          </div>
        </a>

        <!-- screener -->
        <a
          *appUserAccountType="'NORMAL_BASIC'"
          (click)="onNavClick(ROUTES_MAIN.STOCK_SCREENER)"
          class="g-clickable-hover"
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
          class="g-clickable-hover"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.MARKET }"
        >
          <div class="gap-2 flex items-center">
            <mat-icon>travel_explore</mat-icon>
            <span>Market</span>
          </div>
        </a>

        <div class="flex-1 flex justify-end">
          <!-- user on small screen -->
          <div class="flex sm:hidden items-center gap-2 pr-6">
            <!-- avatar -->
            <img
              appDefaultImg
              [src]="userDataSignal()?.personal?.photoURL"
              alt="User Image"
              class="rounded-full w-8 h-8"
            />
            <!-- name -->
            <div>{{ userDataSignal()?.personal?.displayName }}</div>
          </div>

          <!-- search -->
          <app-stock-search-basic-customized
            [showHint]="false"
            displayValue="symbol"
            class="hidden sm:block w-[520px] scale-[0.8] -mr-10 -mb-5"
          />

          <div class="gap-1 items-center hidden xl:flex">
            <!-- display logged in person -->
            <div *ngIf="userDataSignal() as userDataSignal" class="relative mt-2">
              <button mat-button class="h-11" (click)="onMoreOptionsClick()">
                <div class="flex items-center gap-3">
                  <img
                    appDefaultImg
                    class="w-8 h-8 rounded-full"
                    [src]="userDataSignal.personal.photoURL"
                    [alt]="userDataSignal.personal.displayName"
                  />
                  <span>{{ userDataSignal.personal.displayName }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- menu -->
    <ng-template #menuOptions>
      <div class="min-w-[320px] flex flex-col">
        <button
          mat-button
          class="mb-2 hover:bg-gray-100 hover:scale-95 duration-300  w-full h-12"
          (click)="onSettingClick()"
        >
          <mat-icon>settings</mat-icon>
          Settings
        </button>
        <button
          mat-button
          class="mb-2 hover:bg-gray-100 hover:scale-95 duration-300 w-full h-12"
          (click)="onHelpClick()"
        >
          <mat-icon>help</mat-icon>
          Help
        </button>
        <button mat-button class="hover:bg-gray-100 hover:scale-95 duration-300 w-full h-12" (click)="onLogOutClick()">
          <mat-icon>logout</mat-icon>
          Log out
        </button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;

        a {
          @apply hidden xl:block p-4 hover:bg-gray-100 rounded-md px-4;

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
  menuClickEmitter = output<void>();
  private router = inject(Router);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private authenticationService = inject(AuthenticationAccountService);
  private dialog = inject(MatDialog);

  menuOptions = viewChild('menuOptions', { read: TemplateRef });

  userDataSignal = this.authenticationUserStoreService.state.userData;

  ROUTES_MAIN = ROUTES_MAIN;
  activeLinkSignal = signal<ROUTES_MAIN>(ROUTES_MAIN.DASHBOARD);

  ngOnInit(): void {
    // check if url is different than activeLinkSignal
    const url = this.router.url.replace('/', '') as ROUTES_MAIN;
    this.activeLinkSignal.set(url);
  }

  onMenuClick() {
    this.menuClickEmitter.emit();
  }

  onNavClick(navigation: ROUTES_MAIN) {
    this.activeLinkSignal.set(navigation);
    this.router.navigate([navigation]);
  }

  onSettingClick() {
    this.dialog.closeAll();
    this.dialog.open(UserSettingsDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onHelpClick() {
    this.dialog.closeAll();
    this.dialog.open(HelpDialogComponent, {
      panelClass: [SCREEN_DIALOGS.DIALOG_MEDIUM],
    });
  }

  async onLogOutClick() {
    this.dialog.closeAll();
    this.router.navigate([ROUTES_MAIN.LOGIN]);
    this.authenticationService.signOut();
  }

  onMoreOptionsClick() {
    this.dialog.open(GenericDialogComponent, {
      data: <GenericDialogComponentData>{
        title: 'Options',
        templateRef: this.menuOptions(),
      },
    });
  }
}
