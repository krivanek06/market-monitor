import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
import { PortfolioStateComponent } from '@market-monitor/modules/portfolio/ui';
import { ColorValues } from '@market-monitor/shared/data-access';
import { FancyCardComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PortfolioStateComponent, FancyCardComponent],
  templateUrl: './dashboard.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  authenticationUserService = inject(AuthenticationUserService);

  portfolioState = toSignal(this.portfolioUserFacadeService.getPortfolioState());

  ColorValues = ColorValues;
}
