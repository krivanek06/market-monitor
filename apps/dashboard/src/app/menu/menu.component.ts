import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { SCREEN_LAYOUT } from '@market-monitor/shared/data-access';
import { map } from 'rxjs';
import { MenuSideNavigationComponent } from './menu-side-navigation/menu-side-navigation.component';
import { MenuTopNavigationComponent } from './menu-top-navigation/menu-top-navigation.component';

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
    MenuTopNavigationComponent,
  ],
  templateUrl: './menu.component.html',
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

  isOpenSignal = signal<boolean>(false);
  isSmallScreenSignal = toSignal(
    this.breakpointObserver.observe([SCREEN_LAYOUT.LAYOUT_SM]).pipe(map((x) => !x.matches)),
  );

  ngOnInit(): void {}

  toggleMatDrawerExpandedView(): void {
    this.isOpenSignal.set(this.isOpenSignal());
  }
}
