import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService } from '@market-monitor/api-client';
import { SymbolSummary } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general/features';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks/features';
import { StockSummaryListComponent } from '@market-monitor/modules/market-stocks/ui';
import { PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
import { PortfolioStateComponent, PortfolioTransactionsTableComponent } from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { FancyCardComponent } from '@market-monitor/shared/ui';
import { DialogServiceModule } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioStateComponent,
    FancyCardComponent,
    StockSearchBasicCustomizedComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DialogServiceModule,
    AssetPriceChartInteractiveComponent,
    StockSummaryListComponent,
    PortfolioTransactionsTableComponent,
  ],
  templateUrl: './trading.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingComponent {
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  authenticationUserService = inject(AuthenticationUserService);
  marketApiService = inject(MarketApiService);

  portfolioState = toSignal(this.portfolioUserFacadeService.getPortfolioState());
  symbolSummary = toSignal(this.marketApiService.getSymbolSummary('AAPL'));
  userSettings = this.authenticationUserService.userData.settings;

  ColorScheme = ColorScheme;

  onSummaryClick(summary: SymbolSummary) {
    console.log('summary', summary);
  }
}
