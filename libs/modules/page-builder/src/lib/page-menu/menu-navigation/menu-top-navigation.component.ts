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
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { SymbolSearchBasicComponent } from '@mm/market-stocks/features';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { GenericDialogComponent, GenericDialogComponentData, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, HelpDialogComponent } from '@mm/shared/ui';
import { UserSettingsDialogComponent } from '@mm/user/features';

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
    SymbolSearchBasicComponent,
    GenericDialogComponent,
  ],
  template: `
    <div class="bg-wt-background-present w-full p-2 shadow-md">
      <nav class="mx-auto flex w-full max-w-[1620px] items-center gap-4 pb-1 pl-3 sm:pl-8 sm:pr-4">
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
          <div class="flex items-center gap-2">
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
          <div class="flex items-center gap-2">
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
          <div class="flex items-center gap-2">
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
          <div class="flex items-center gap-2">
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
          <div class="flex items-center gap-2">
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
          <div class="flex items-center gap-2">
            <mat-icon>search</mat-icon>
            <span>Screener</span>
          </div>
        </a>

        <!-- market -->
        <a
          *appUserAccountType="'DEMO_TRADING'"
          (click)="onNavClick(ROUTES_MAIN.COMPARE_USERS)"
          class="g-clickable-hover"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.COMPARE_USERS }"
        >
          <div class="flex items-center gap-2">
            <mat-icon>diversity_3</mat-icon>
            <span>Compare Users</span>
          </div>
        </a>

        <!-- market -->
        <a
          (click)="onNavClick(ROUTES_MAIN.MARKET)"
          class="g-clickable-hover"
          [ngClass]="{ 'c-active': activeLinkSignal() == ROUTES_MAIN.MARKET }"
        >
          <div class="flex items-center gap-2">
            <mat-icon>travel_explore</mat-icon>
            <span>Market</span>
          </div>
        </a>

        <div class="flex flex-1 justify-end">
          <!-- search -->
          <app-symbol-search-basic displayValue="symbol" class="-mb-5 -mr-10 hidden w-[400px] scale-[0.8] sm:block" />

          <div class="hidden items-center gap-1 xl:flex">
            <!-- display logged in person -->
            <div *ngIf="userDataSignal() as userDataSignal" class="relative mx-2 mt-2">
              <button mat-button class="h-11 px-4" (click)="onMoreOptionsClick()">
                <div class="flex items-center gap-3">
                  <img
                    appDefaultImg
                    class="h-8 w-8 rounded-full"
                    [src]="userDataSignal.personal.photoURL"
                    [alt]="userDataSignal.personal.displayName"
                  />
                  <span>{{ userDataSignal.personal.displayNameInitials }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- menu -->
    <ng-template #menuOptions>
      <div class="flex min-w-[320px] flex-col">
        <button
          mat-button
          class="hover:bg-wt-gray-light-strong g-clickable-hover mb-2 h-12 w-full"
          (click)="onSettingClick()"
        >
          <mat-icon>settings</mat-icon>
          Settings
        </button>
        <button
          mat-button
          class="hover:bg-wt-gray-light-strong g-clickable-hover mb-2 h-12 w-full"
          (click)="onHelpClick()"
        >
          <mat-icon>help</mat-icon>
          Help
        </button>
        <button
          mat-button
          class="hover:bg-wt-gray-light-strong g-clickable-hover h-12 w-full"
          (click)="onLogOutClick()"
        >
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
          @apply hover:bg-wt-gray-light-strong hidden rounded-md p-4 px-4 xl:block;

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
    await this.router.navigate([ROUTES_MAIN.LOGIN]);
    this.dialog.closeAll();
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
