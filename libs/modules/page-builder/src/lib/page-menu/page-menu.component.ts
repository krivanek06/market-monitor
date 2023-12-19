import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { SCREEN_LAYOUT } from '@market-monitor/shared/data-access';
import { DialogServiceModule, LoaderMainService } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';
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

    // do not remove - allows showing dialogs sub child routes
    DialogServiceModule,
  ],
  template: `
    <!-- top navigation on big screen -->
    <header>
      <app-menu-top-navigation *ngIf="!isScreenXLSignal()"></app-menu-top-navigation>
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
  isScreenSmSignal = toSignal(this.breakpointObserver.observe([SCREEN_LAYOUT.LAYOUT_SM]).pipe(map((x) => !x.matches)));
  isScreenXLSignal = toSignal(this.breakpointObserver.observe([SCREEN_LAYOUT.LAYOUT_XL]).pipe(map((x) => !x.matches)));

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
