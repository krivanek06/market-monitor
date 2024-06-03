import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { DialogServiceModule } from '@mm/shared/dialog-manager';
import { LoaderMainService } from '@mm/shared/general-features';
import { ThemeService } from '@mm/shared/theme-switcher';
import { MenuSideNavigationComponent } from './menu-navigation/menu-side-navigation.component';
import { MenuTopNavigationComponent } from './menu-navigation/menu-top-navigation.component';
@Component({
  selector: 'app-page-menu',
  standalone: true,
  imports: [
    CommonModule,
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
  ],
  template: `
    <mat-drawer-container autosize class="h-full min-h-[100vh]">
      <!-- side nav -->
      <mat-drawer
        mode="over"
        [opened]="isOpen()"
        class="block w-5/12 min-w-[275px] sm:min-w-[375px] md:w-3/12 xl:hidden"
        role="navigation"
        (closed)="toggleMatDrawerExpandedView()"
      >
        <app-menu-side-navigation />
      </mat-drawer>

      <mat-drawer-content class="overflow-x-clip">
        <!-- top navigation on big screen -->
        <header>
          <app-menu-top-navigation (menuClickEmitter)="toggleMatDrawerExpandedView()"></app-menu-top-navigation>
        </header>

        <div class="c-content-wrapper">
          <!-- content -->
          <div *ngIf="loadingSignal()" class="grid min-h-screen min-w-full place-content-center pb-[15%]">
            <mat-spinner></mat-spinner>
          </div>

          <main [ngClass]="{ hidden: loadingSignal() }">
            <router-outlet></router-outlet>
          </main>
          <!-- footer for additional space on bottom -->
          <footer class="h-12 w-full"></footer>
        </div>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: `
    :host {
      display: block;
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

      @screen xl {
        padding: 28px 24px 40px 24px;
        max-width: 1560px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMenuComponent {
  /**
   * used to init the service to set theme eagerly
   */
  private themeService = inject(ThemeService);
  loaderMainService = inject(LoaderMainService);
  loadingSignal = toSignal(this.loaderMainService.getLoading());

  isOpen = signal<boolean>(false);

  toggleMatDrawerExpandedView(): void {
    this.isOpen.set(!this.isOpen());
    console.log('toggleMatDrawerExpandedView', this.isOpen());
  }
}
