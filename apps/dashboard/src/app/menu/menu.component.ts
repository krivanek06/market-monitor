import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { SCREEN_LAYOUT } from '@market-monitor/shared/data-access';
import { LoaderMainService } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';
import { MenuSideNavigationComponent } from './menu-side-navigation/menu-side-navigation.component';

@Component({
  selector: 'app-menu',
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
  ],
  template: `
    <mat-drawer-container autosize class="h-full">
      <!-- side nav -->
      <mat-drawer
        [mode]="isSmallScreenSignal() ? 'over' : 'side'"
        [opened]="true"
        class="w-2/12 min-w-[275px]"
        role="navigation"
        (closed)="toggleMatDrawerExpandedView()"
      >
        <app-menu-side-navigation></app-menu-side-navigation>
      </mat-drawer>

      <mat-drawer-content>
        <div class="px-10 pt-6 c-content-wrapper">
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
          max-width: 1440px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  breakpointObserver = inject(BreakpointObserver);

  loadingSignal = toSignal(inject(LoaderMainService).getLoading());
  isOpenSignal = signal<boolean>(false);
  isSmallScreenSignal = toSignal(
    this.breakpointObserver.observe([SCREEN_LAYOUT.LAYOUT_SM]).pipe(map((x) => !x.matches)),
  );

  ngOnInit(): void {}

  toggleMatDrawerExpandedView(): void {
    this.isOpenSignal.set(this.isOpenSignal());
  }
}
