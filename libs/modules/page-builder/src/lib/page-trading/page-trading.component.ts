import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { getRandomIndex } from '@market-monitor/shared/features/general-util';
import { FancyCardComponent, QuoteItemComponent, RangeDirective, SortByKeyPipe } from '@market-monitor/shared/ui';
import { take } from 'rxjs';

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
    QuoteItemComponent,
    RangeDirective,
  ],
  template: `
    <!-- account state -->
    <ng-container *ngIf="portfolioState() as portfolioState">
      <div class="flex flex-col lg:flex-row justify-between mb-10 gap-y-10">
        <!-- account state -->
        <app-portfolio-state
          class="lg:basis-3/5 md:pl-10"
          [titleColor]="ColorScheme.PRIMARY_VAR"
          [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
          [showCashSegment]="!!userDataSignal().features.allowPortfolioCashAccount"
          [portfolioState]="portfolioState"
        ></app-portfolio-state>

        <div>
          <!-- search -->
          <app-stock-search-basic-customized
            (clickedSummary)="onSummaryClick($event)"
            [openModalOnClick]="false"
            [showValueChange]="false"
            [showHint]="false"
            class="scale-90 md:min-w-[600px] mb-2"
          ></app-stock-search-basic-customized>

          <!-- action buttons -->
          <div class="flex items-center gap-4 md:px-10">
            <ng-container *ngIf="symbolSummarySignal()">
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
        *ngIf="symbolSummarySignal() as symbolSummary; else noSelectedSummary"
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

      <!-- top active -->
      <div class="mb-10 hidden lg:block">
        <h2 class="text-xl text-wt-primary">Top Active</h2>

        <div class="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-8 p-4">
          @for (item of topPerformanceSignal()?.stockTopActive; track item.id) {
            <app-quote-item
              (click)="onSummaryClick(item)"
              class="g-clickable-hover px-4 border-r border-l border-solid"
              [showValueChange]="false"
              [symbolQuote]="item.quote"
              displayValue="symbol"
            ></app-quote-item>
          } @empty {
            <div *ngRange="20" class="g-skeleton h-9"></div>
          }
        </div>
      </div>

      <div>
        <h2 class="flex items-center gap-4 pl-1 mb-3 text-xl text-wt-primary">
          <mat-icon>history</mat-icon>
          Transaction History
        </h2>
        <app-portfolio-transactions-table
          (deleteEmitter)="onTransactionDelete($event)"
          [showTransactionFees]="!!userDataSignal().features.allowPortfolioCashAccount"
          [showActionButton]="!userDataSignal().features.allowPortfolioCashAccount"
          [data]="portfolioTransactionSignal() | sortByKey: 'date' : 'desc'"
        ></app-portfolio-transactions-table>
      </div>

      <!-- templates -->
      <ng-template #noSelectedSummary>
        <div class="flex flex-col gap-4 mb-6 lg:flex-row h-[480px]">
          <div class="lg:basis-3/5 g-skeleton"></div>
          <div class="lg:basis-2/5 g-skeleton"></div>
        </div>
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
  private portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  private authenticationUserService = inject(AuthenticationUserStoreService);
  private marketApiService = inject(MarketApiService);
  private dialog = inject(MatDialog);
  private dialogServiceUtil = inject(DialogServiceUtil);

  /**
   * displayed symbol summary
   */
  symbolSummarySignal = signal<SymbolSummary | null>(null);

  topPerformanceSignal = toSignal(this.marketApiService.getMarketTopPerformance());

  portfolioState = this.portfolioUserFacadeService.getPortfolioState;
  portfolioTransactionSignal = this.authenticationUserService.state.portfolioTransactions;
  userDataSignal = this.authenticationUserService.state.getUserData;

  ColorScheme = ColorScheme;

  constructor() {
    // preload one random symbol into selectedSummary
    this.marketApiService
      .getMarketTopPerformance()
      .pipe(take(1))
      .subscribe((topPerformance) => {
        const randomNumber = getRandomIndex(topPerformance?.stockTopActive.length ?? 0);
        const randomSummary = topPerformance?.stockTopActive[randomNumber];
        this.onSummaryClick(randomSummary);
      });
  }

  onSummaryClick(summary: SymbolSummary) {
    this.symbolSummarySignal.set(summary);
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
    const summary = this.symbolSummarySignal();
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
