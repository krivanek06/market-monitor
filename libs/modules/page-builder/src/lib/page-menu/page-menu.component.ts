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
        class="w-5/12 md:w-3/12 min-w-[275px] sm:min-w-[375px] block xl:hidden"
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
          <div *ngIf="loadingSignal()" class="grid place-content-center pb-[15%] min-h-screen min-w-full">
            <mat-spinner></mat-spinner>
          </div>

          <main [ngClass]="{ hidden: loadingSignal() }">
            <router-outlet></router-outlet>
          </main>
          <!-- footer for additional space on bottom -->
          <footer class="w-full h-12"></footer>
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
        padding: 28px 32px 40px 32px;
        max-width: 1560px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMenuComponent {
  loaderMainService = inject(LoaderMainService);
  loadingSignal = toSignal(this.loaderMainService.getLoading());

  isOpen = signal<boolean>(false);

  constructor() {}

  toggleMatDrawerExpandedView(): void {
    this.isOpen.set(!this.isOpen());
    console.log('toggleMatDrawerExpandedView', this.isOpen());
  }
}
