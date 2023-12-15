import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { SCREEN_LAYOUT } from '@market-monitor/shared/data-access';
import { DialogServiceModule, LoaderMainService } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';
import { MenuSideNavigationComponent } from './menu-navigation/menu-side-navigation.component';
import { MenuTopNavigationComponent } from './menu-navigation/menu-top-navigation.component';

@Component({
  selector: 'app-page-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatDividerModule,
    MenuSideNavigationComponent,
    MatProgressSpinnerModule,
    MenuTopNavigationComponent,

    // do not remove - allows showing dialogs sub child routes
    DialogServiceModule,
  ],
  template: `
    <mat-drawer-container autosize class="h-full">
      <!-- side nav -->
      <mat-drawer
        [mode]="isSmallScreenSignal() ? 'over' : 'side'"
        [opened]="false"
        class="w-2/12 min-w-[275px]"
        role="navigation"
        (closed)="toggleMatDrawerExpandedView()"
      >
        <app-menu-side-navigation></app-menu-side-navigation>
      </mat-drawer>

      <mat-drawer-content>
        <!-- top navigation on big screen -->
        <app-menu-top-navigation></app-menu-top-navigation>

        <div class="c-content-wrapper">
          <!-- content -->
          <div *ngIf="loadingSignal()" class="grid place-content-center pb-[15%] min-h-screen min-w-full">
            <mat-spinner></mat-spinner>
          </div>

          <div [ngClass]="{ hidden: loadingSignal() }">
            <router-outlet></router-outlet>
          </div>
          <!-- footer for additional space on bottom -->
          <footer class="w-full h-12"></footer>
        </div>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-drawer-container {
        overflow: visible;
        height: 100vh !important;
      }

      .c-content-wrapper {
        height: auto;
        padding: 24px 20px 40px 20px;
        max-width: 100%;
        margin: auto;

        @screen xl {
          padding: 24px 32px 40px 32px;
          max-width: 1560px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMenuComponent implements OnInit {
  breakpointObserver = inject(BreakpointObserver);
  authenticationUserStoreService = inject(AuthenticationUserStoreService);
  loaderMainService = inject(LoaderMainService);

  loadingSignal = toSignal(this.loaderMainService.getLoading());
  isOpenSignal = signal<boolean>(false);
  isSmallScreenSignal = toSignal(
    this.breakpointObserver.observe([SCREEN_LAYOUT.LAYOUT_SM]).pipe(map((x) => !x.matches)),
  );

  constructor() {
    //this.loaderMainService.setLoading(true);

    effect(() => {
      // const user = this.authenticationUserStoreService.state.user();
      // console.log('this is effect', user);
      // this.loaderMainService.setLoading(!!user);
    });

    // toObservable(this.portfolioUserFacadeService.getPortfolioState)
    //   .pipe(
    //     tap(() => this.loaderMainService.setLoading(false)),
    //     take(1),
    //   )
    //   .subscribe();
  }

  ngOnInit(): void {}

  toggleMatDrawerExpandedView(): void {
    this.isOpenSignal.set(this.isOpenSignal());
  }
}
