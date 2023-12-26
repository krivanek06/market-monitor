import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarketApiService } from '@market-monitor/api-client';
import { PortfolioTransaction, PortfolioTransactionType, SymbolSummary } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general/features';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks/features';
import { StockSummaryListComponent } from '@market-monitor/modules/market-stocks/ui';
import { PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioTradeDialogComponent,
  PortfolioTradeDialogComponentData,
} from '@market-monitor/modules/portfolio/features';
import { PortfolioStateComponent, PortfolioTransactionsTableComponent } from '@market-monitor/modules/portfolio/ui';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { FancyCardComponent, SortByKeyPipe } from '@market-monitor/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-page-trading',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioStateComponent,
    FancyCardComponent,
    StockSearchBasicCustomizedComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AssetPriceChartInteractiveComponent,
    StockSummaryListComponent,
    PortfolioTransactionsTableComponent,
    PortfolioTradeDialogComponent,
    MatTooltipModule,
    SortByKeyPipe,
  ],
  templateUrl: './page-trading.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingComponent {
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  authenticationUserService = inject(AuthenticationUserStoreService);
  marketApiService = inject(MarketApiService);
  dialog = inject(MatDialog);
  dialogServiceUtil = inject(DialogServiceUtil);

  selectedSummary = signal<SymbolSummary | null>(null);
  symbolSummary = toSignal(
    toObservable(this.selectedSummary).pipe(
      filterNil(),
      switchMap((summary) => this.marketApiService.getSymbolSummary(summary.id)),
    ),
  );

  portfolioState = this.portfolioUserFacadeService.getPortfolioState;
  portfolioTransactionSignal = this.authenticationUserService.state.portfolioTransactions;
  userDataSignal = this.authenticationUserService.state.getUserData;

  ColorScheme = ColorScheme;

  onSummaryClick(summary: SymbolSummary) {
    this.selectedSummary.set(summary);
  }

  @Confirmable('Please confirm removing transaction')
  onTransactionDelete(transaction: PortfolioTransaction) {
    try {
      this.portfolioUserFacadeService.deleteTransactionOperation(transaction);
      this.dialogServiceUtil.showNotificationBar('Transaction removed', 'notification');
    } catch (e) {
      console.log(e);
      this.dialogServiceUtil.showNotificationBar('Transaction failed to remove', 'error');
    }
  }

  onOperationClick(transactionType: PortfolioTransactionType): void {
    console.log('operation', transactionType);
    const summary = this.selectedSummary();
    if (!summary) {
      this.dialogServiceUtil.showNotificationBar('Please select a stock first', 'notification');
      return;
    }

    this.dialog.open(PortfolioTradeDialogComponent, {
      data: <PortfolioTradeDialogComponentData>{
        transactionType: transactionType,
        summary: summary,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });
  }
}
