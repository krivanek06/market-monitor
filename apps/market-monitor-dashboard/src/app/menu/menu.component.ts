import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { SCREEN_LAYOUT } from '@market-monitor/shared-utils-client';
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
  ],
  templateUrl: './menu.component.html',
  styles: [
    `
      :host {
        display: block;
      }

      mat-drawer-container {
        overflow: visible;
        height: 100vh;
      }

      mat-drawer-content {
        height: auto;
        padding: 24px 20px 40px 20px;
        max-width: 100%;

        @screen xl {
          padding: 24px 12px 40px 12px;
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
