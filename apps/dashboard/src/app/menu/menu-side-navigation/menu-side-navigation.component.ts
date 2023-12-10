import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationAccountService } from '@market-monitor/modules/authentication/data-access';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { DefaultImgDirective } from '@market-monitor/shared/ui';
import { sideNavigation } from './menu-routing.model';

@Component({
  selector: 'app-menu-side-navigation',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, MatIconModule, RouterModule, DefaultImgDirective],
  templateUrl: './menu-side-navigation.component.html',
  styles: [
    `
      :host {
        @apply block h-full;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSideNavigationComponent implements OnInit {
  private router = inject(Router);
  private authenticationService = inject(AuthenticationAccountService);

  userDataSignal = toSignal(this.authenticationService.getUserData());

  sideNavigation = sideNavigation;
  selectedNavigationPath = '';

  ngOnInit(): void {
    this.selectedNavigationPath = this.router.url.split('/')[1]; // ['', 'dashboard']
  }

  onNavigationClick(path: string) {
    console.log('path', path);
    this.selectedNavigationPath = path;
  }

  async onLogout(): Promise<void> {
    await this.authenticationService.signOut();
    this.router.navigate([ROUTES_MAIN.LOGIN]);
  }
}
