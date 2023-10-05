import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationAccountService } from '@market-monitor/modules/authentication/data-access';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks/features';
import { DASHBOARD_MAIN_ROUTES } from '@market-monitor/shared/data-access';

@Component({
  selector: 'app-menu-top-navigation',
  standalone: true,
  imports: [CommonModule, StockSearchBasicCustomizedComponent, MatDialogModule, MatButtonModule],
  templateUrl: './menu-top-navigation.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuTopNavigationComponent {
  authenticationService = inject(AuthenticationAccountService);
  router = inject(Router);
  async onLogout(): Promise<void> {
    await this.authenticationService.signOut();
    this.router.navigate([DASHBOARD_MAIN_ROUTES.LOGIN]);
  }
}
