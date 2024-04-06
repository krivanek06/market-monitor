import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarketApiService } from '@mm/api-client';
import { PortfolioStateHolding, PortfolioTransaction, PortfolioTransactionType, SymbolSummary } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { StockSearchBasicCustomizedComponent } from '@mm/market-stocks/features';
import { StockSummaryListComponent } from '@mm/market-stocks/ui';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from '@mm/portfolio/features';
import { PortfolioStateComponent, PortfolioTransactionsTableComponent } from '@mm/portfolio/ui';
import { ColorScheme } from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil, SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { getRandomIndex } from '@mm/shared/general-util';
import {
  FormMatInputWrapperComponent,
  QuoteItemComponent,
  RangeDirective,
  SectionTitleComponent,
  SortByKeyPipe,
} from '@mm/shared/ui';
import { take } from 'rxjs';

@Component({
  selector: 'app-page-trading',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioStateComponent,
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
    SectionTitleComponent,
    FormMatInputWrapperComponent,
    ReactiveFormsModule,
  ],
  template: `
    <!-- account state -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-6 xl:mb-2 gap-8">
      <!-- account state -->
      <app-portfolio-state
        class="sm:pl-10"
        [titleColor]="ColorScheme.PRIMARY_VAR"
        [valueColor]="ColorScheme.GRAY_MEDIUM_VAR"
        [showCashSegment]="authenticationUserService.state.isAccountDemoTrading()"
        [portfolioState]="portfolioUserFacadeService.getPortfolioState()"
      ></app-portfolio-state>

      <div class="flex flex-col xl:flex-row gap-x-6 gap-y-6 xl:col-span-2 max-md:-ml-4">
        <!-- holdings -->
        <app-form-mat-input-wrapper
          inputCaption="Select a holding"
          inputType="SELECT"
          [inputSource]="portfolioUserFacadeService.getHoldingsInputSource()"
          displayImageType="symbol"
          [formControl]="selectedHoldingControl"
          class="scale-90 w-full h-12"
        ></app-form-mat-input-wrapper>

        <!-- search -->
        <app-stock-search-basic-customized
          (clickedSummary)="onSummaryClick($event)"
          [openModalOnClick]="false"
          [showHint]="false"
          class="scale-90 w-full h-12"
        ></app-stock-search-basic-customized>
      </div>
    </div>

    <!-- action buttons -->
    <div class="flex flex-col sm:flex-row xl:justify-end gap-4 mb-6">
      <button
        (click)="onOperationClick('BUY')"
        class="w-full xl:w-[280px]"
        mat-stroked-button
        color="accent"
        type="button"
      >
        BUY
      </button>
      <button
        (click)="onOperationClick('SELL')"
        class="w-full xl:w-[280px]"
        mat-stroked-button
        color="warn"
        type="button"
      >
        SELL
      </button>
    </div>

    <!-- historical chart & summary -->
    <div
      *ngIf="symbolSummarySignal() as symbolSummary; else noSelectedSummary"
      class="flex flex-col gap-4 mb-6 xl:flex-row"
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
      <app-section-title title="Top Active" />

      <div class="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-2 p-4">
        @for (item of topPerformanceSignal()?.stockTopActive; track item.id) {
          <div
            (click)="onSummaryClick(item)"
            [ngClass]="{
              'border-wt-primary': item.id === symbolSummarySignal()?.id,
              border: item.id === symbolSummarySignal()?.id
            }"
            class="g-clickable-hover py-2 px-4 border-r border-l border-solid hover:border rounded-lg border-wt-border"
          >
            <app-quote-item [symbolQuote]="item.quote" displayValue="symbol"></app-quote-item>
          </div>
        } @empty {
          <div *ngRange="20" class="g-skeleton h-9"></div>
        }
      </div>
    </div>

    <!-- transaction history -->
    <div>
      <app-section-title title="Transaction History" matIcon="history" class="mb-3" />

      <app-portfolio-transactions-table
        (deleteEmitter)="onTransactionDelete($event)"
        [showTransactionFees]="authenticationUserService.state.isAccountDemoTrading()"
        [showActionButton]="authenticationUserService.state.isAccountNormalBasic()"
        [data]="authenticationUserService.state.portfolioTransactions() | sortByKey: 'date' : 'desc'"
      ></app-portfolio-transactions-table>
    </div>

    <!-- templates -->
    <ng-template #noSelectedSummary>
      <div class="flex flex-col gap-4 mb-6 xl:flex-row h-[480px]">
        <div class="lg:basis-3/5 g-skeleton"></div>
        <div class="lg:basis-2/5 g-skeleton"></div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingComponent {
  private marketApiService = inject(MarketApiService);
  private dialog = inject(MatDialog);
  private dialogServiceUtil = inject(DialogServiceUtil);

  authenticationUserService = inject(AuthenticationUserStoreService);
  portfolioUserFacadeService = inject(PortfolioUserFacadeService);

  /**
   * displayed symbol summary
   */
  symbolSummarySignal = signal<SymbolSummary | null>(null);

  topPerformanceSignal = toSignal(this.marketApiService.getMarketTopPerformance());

  ColorScheme = ColorScheme;

  /**
   * track the selected holding by user, null if else is selected
   */
  selectedHoldingControl = new FormControl<PortfolioStateHolding | null>(null);

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

    // listen on selected holding change and load summary
    this.selectedHoldingControl.valueChanges.subscribe((holding) => {
      if (holding?.symbolSummary) {
        this.symbolSummarySignal.set(holding.symbolSummary);
      }
    });
  }

  onSummaryClick(summary: SymbolSummary) {
    this.symbolSummarySignal.set(summary);
    // reset holding selection
    this.selectedHoldingControl.patchValue(null, { emitEvent: false });
  }

  @Confirmable('Please confirm removing transaction')
  onTransactionDelete(transaction: PortfolioTransaction) {
    this.portfolioUserFacadeService.deletePortfolioOperation(transaction);
    this.dialogServiceUtil.showNotificationBar('Transaction removed', 'notification');
  }

  onOperationClick(transactionType: PortfolioTransactionType): void {
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
