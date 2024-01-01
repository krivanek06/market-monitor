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
  template: `
    <!-- account state -->
    <ng-container *ngIf="portfolioState() as portfolioState">
      <div class="flex justify-between gap-x-10 mb-10 md:px-10">
        <!-- account state -->
        <app-portfolio-state
          class="basis-3/5"
          [titleColor]="ColorScheme.PRIMARY_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showCashSegment]="!!userDataSignal().features.userPortfolioAllowCashAccount"
          [portfolioState]="portfolioState"
        ></app-portfolio-state>

        <div>
          <!-- search -->
          <app-stock-search-basic-customized
            (clickedSummary)="onSummaryClick($event)"
            [openModalOnClick]="false"
            [showValueChange]="false"
            class="scale-90 min-w-[600px] mb-2"
          ></app-stock-search-basic-customized>

          <!-- action buttons -->
          <div class="flex items-center gap-4 md:px-10">
            <ng-container *ngIf="symbolSummary()">
              <button (click)="onOperationClick('BUY')" class="flex-1" mat-stroked-button color="accent" type="button">
                BUY
              </button>
              <button (click)="onOperationClick('SELL')" class="flex-1" mat-stroked-button color="warn" type="button">
                SELL
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- historical chart & summary -->
      <div
        *ngIf="symbolSummary() as symbolSummary; else noSelectedSummary"
        class="flex flex-col gap-4 mb-6 lg:flex-row"
      >
        <app-asset-price-chart-interactive
          class="lg:basis-3/5"
          [imageName]="symbolSummary.id"
          [symbol]="symbolSummary.id"
          [title]="'Historical Price: ' + symbolSummary.id"
        ></app-asset-price-chart-interactive>
        <div class="lg:basis-2/5">
          <app-stock-summary-list [symbolSummary]="symbolSummary"></app-stock-summary-list>
        </div>
      </div>

      <div>
        <h2 class="flex items-center gap-4 pl-1 mb-3 text-xl text-wt-primary">
          <mat-icon>history</mat-icon>
          Transaction History
        </h2>
        <app-portfolio-transactions-table
          (deleteEmitter)="onTransactionDelete($event)"
          [showTransactionFees]="!!userDataSignal().features.userPortfolioAllowCashAccount"
          [showActionButton]="!userDataSignal().features.userPortfolioAllowCashAccount"
          [data]="portfolioTransactionSignal() | sortByKey: 'date' : 'desc'"
        ></app-portfolio-transactions-table>
      </div>

      <!-- templates -->
      <ng-template #noSelectedSummary>
        <div class="h-[300px] grid place-content-center text-2xl">Please select a symbol</div>
      </ng-template>
    </ng-container>
  `,
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
