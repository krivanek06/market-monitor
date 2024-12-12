import { DOCUMENT, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { GuardsCheckEnd, GuardsCheckStart, NavigationCancel, Router, RouterModule } from '@angular/router';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { SCREEN_LAYOUT_VALUES } from '@mm/shared/data-access';
import { DialogServiceModule } from '@mm/shared/dialog-manager';
import { WINDOW_RESIZE_LISTENER } from '@mm/shared/ui';
import { delay, filter, map } from 'rxjs';
import { MenuSideNavigationComponent } from './menu-navigation/menu-side-navigation.component';
import { MenuTopNavigationComponent } from './menu-navigation/menu-top-navigation.component';

@Component({
  selector: 'app-page-menu',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MenuTopNavigationComponent,
    MatSidenavModule,
    MenuSideNavigationComponent,
    // do not remove - allows showing dialogs sub child routes
    DialogServiceModule,
    MatProgressSpinnerModule,
    NgClass,
  ],
  template: `
    <mat-drawer-container autosize class="h-full min-h-[100vh]">
      <!-- side nav -->
      <mat-drawer
        [mode]="useSidePanelModeOver() ? 'over' : 'side'"
        [opened]="isOpen()"
        (closed)="isOpen.set(false)"
        class="fixed block min-w-[280px] md:w-[300px]"
        role="navigation"
      >
        <app-menu-side-navigation />
      </mat-drawer>

      <mat-drawer-content class="overflow-x-clip">
        <!-- top navigation on big screen -->
        <header>
          <app-menu-top-navigation [(menuClick)]="isOpen" />
        </header>

        <div class="c-content-wrapper">
          <!-- spinner -->
          <div
            class="grid w-full place-content-center pt-[20%]"
            [ngClass]="{
              hidden: !isRouterGuardActive(),
            }"
          >
            <mat-spinner />
          </div>

          <!-- content -->
          <div [ngClass]="{ hidden: isRouterGuardActive() }">
            <router-outlet />
          </div>

          <!-- footer for additional space on bottom -->
          <footer class="h-12 w-full"></footer>
        </div>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: `
    :host {
      display: block;
      overflow-x: clip;
    }

    .mat-drawer:not(.mat-drawer-side) {
      position: fixed;
    }

    .mat-drawer-backdrop {
      position: fixed !important;
    }

    .c-content-wrapper {
      height: auto;
      padding: 24px 20px 40px 20px;
      max-width: 100%;
      margin: auto;

      @screen md {
        padding: 28px 32px 40px 32px;
      }

      @screen xl {
        padding: 28px 32px 40px 32px;
        max-width: 1560px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMenuComponent {
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  readonly isRouterGuardActive = toSignal(
    this.router.events.pipe(
      filter(
        (event) =>
          event instanceof GuardsCheckStart || event instanceof GuardsCheckEnd || event instanceof NavigationCancel,
      ),
      map((event) => event instanceof GuardsCheckStart),
      // wait some time to redraw the screen and just then remove the spinner
      delay(100),
    ),
  );
  readonly isOpen = signal<boolean>(true);
  readonly windowResize = inject(WINDOW_RESIZE_LISTENER);
  readonly useSidePanelModeOver = computed(() => this.windowResize() < SCREEN_LAYOUT_VALUES.LAYOUT_2XL);

  readonly windowResizeEffect = effect(() => {
    const windowResize = this.windowResize();

    // open side panel if screen is bigger than 2xl
    if (windowResize >= SCREEN_LAYOUT_VALUES.LAYOUT_2XL) {
      this.isOpen.set(true);
    }
  });

  constructor() {
    // check if dark mode is enabled
    const val = !!this.authenticationUserStoreService.state.getUserDataNormal()?.settings?.isDarkMode;
    const darkClass = 'dark-theme';
    if (val) {
      this.document.body.classList.add(darkClass);
    } else {
      this.document.body.classList.remove(darkClass);
    }
  }
}
