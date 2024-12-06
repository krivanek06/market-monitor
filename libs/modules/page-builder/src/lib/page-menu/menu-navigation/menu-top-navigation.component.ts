import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, model, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { AuthenticationAccountService, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { SymbolSearchBasicComponent } from '@mm/market-stocks/features';
import { ROUTES_MAIN, SCREEN_LAYOUT_VALUES } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DefaultImgDirective, HelpDialogComponent, WINDOW_RESIZE_LISTENER } from '@mm/shared/ui';
import { UserSettingsDialogComponent } from '@mm/user/features';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-menu-top-navigation',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DefaultImgDirective,
    SymbolSearchBasicComponent,
  ],
  template: `
    <div class="bg-wt-background-present w-full shadow-md">
      <nav class="mx-auto flex w-full max-w-[1620px] items-center gap-4 p-2 sm:pl-8 sm:pr-4">
        <!-- mobile screen -->
        <div class="flex items-center gap-x-2">
          @if (displaySidePanelButton()) {
            <!-- menu button -->
            <button type="button" mat-icon-button (click)="onMenuClick()">
              <mat-icon>menu</mat-icon>
            </button>
          }

          <!-- page title -->
          <div class="text-wt-primary text-lg">{{ pageName() }}</div>
        </div>

        <div class="flex flex-1 items-center justify-end">
          <!-- search -->
          <app-symbol-search-basic class="-mr-6 hidden w-[475px] scale-90 md:block xl:w-[450px]" />

          <!-- user menu -->
          @if (userDataSignal(); as userDataSignal) {
            <div class="relative mx-2">
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
          }
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
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuTopNavigationComponent {
  readonly menuClick = model<boolean>();
  private readonly router = inject(Router);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly authenticationService = inject(AuthenticationAccountService);
  private readonly dialog = inject(MatDialog);

  readonly menuOptions = viewChild('menuOptions', { read: TemplateRef<HTMLElement> });

  readonly userDataSignal = this.authenticationUserStoreService.state.userData;
  readonly windowResize = inject(WINDOW_RESIZE_LISTENER);
  readonly displaySidePanelButton = computed(() => this.windowResize() < SCREEN_LAYOUT_VALUES.LAYOUT_2XL);

  readonly pageName = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationStart),
      map((event) => event?.url || ''),
      startWith(this.router.url),
      map((url) => this.resolveActiveRouteName(url)),
    ),
    { initialValue: 'GGFinance' },
  );

  onMenuClick() {
    this.menuClick.set(!this.menuClick());
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
    this.dialog.open(this.menuOptions()!, {});
  }

  private resolveActiveRouteName(route: string): string {
    if (route.includes(ROUTES_MAIN.DASHBOARD)) {
      return 'Dashboard';
    }

    if (route.includes(ROUTES_MAIN.WATCHLIST)) {
      return 'Watchlist';
    }

    if (route.includes(ROUTES_MAIN.TRADING_SIMULATOR)) {
      return 'Trading Simulator';
    }

    if (route.includes(ROUTES_MAIN.TRADING)) {
      return 'Trading';
    }

    if (route.includes(ROUTES_MAIN.GROUPS)) {
      return 'Groups';
    }

    if (route.includes(ROUTES_MAIN.HALL_OF_FAME)) {
      return 'Ranking';
    }

    if (route.includes(ROUTES_MAIN.COMPARE_USERS)) {
      return 'Compare';
    }

    if (route.includes(ROUTES_MAIN.STOCK_SCREENER)) {
      return 'Screener';
    }

    if (route.includes(ROUTES_MAIN.MARKET_CALENDAR)) {
      return 'Calendar';
    }

    if (route.includes(ROUTES_MAIN.ECONOMICS)) {
      return 'Economics';
    }

    if (route.includes(ROUTES_MAIN.NEWS)) {
      return 'News';
    }

    if (route.includes(ROUTES_MAIN.TOP_PERFORMERS)) {
      return 'Top Performers';
    }

    // default fallback
    return 'GGFinance';
  }
}
