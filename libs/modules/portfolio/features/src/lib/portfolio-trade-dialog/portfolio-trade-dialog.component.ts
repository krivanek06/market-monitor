import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarketApiService } from '@market-monitor/api-client';
import { PortfolioTransactionType, SymbolSummary, USER_HOLDINGS_SYMBOL_LIMIT } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { PortfolioTransactionCreate, PortfolioUserFacadeService } from '@market-monitor/modules/portfolio/data-access';
import {
  CastToNumberPipe,
  DatePickerComponent,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
  InputTypeDateTimePickerConfig,
  NumberKeyboardComponent,
} from '@market-monitor/shared/ui';
import {
  DialogServiceUtil,
  minValueValidator,
  positiveNumberValidator,
  requiredValidator,
} from '@market-monitor/shared/utils-client';
import { dateFormatDate, dateIsNotWeekend } from '@market-monitor/shared/utils-general';
import { isSameDay } from 'date-fns';
import { map, switchMap, tap } from 'rxjs';

export type PortfolioTradeDialogComponentData = {
  summary: SymbolSummary;
  transactionType: PortfolioTransactionType;
};

@Component({
  selector: 'market-monitor-portfolio-trade-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DialogCloseHeaderComponent,
    MatDividerModule,
    ReactiveFormsModule,
    FormMatInputWrapperComponent,
    DatePickerComponent,
    DefaultImgDirective,
    MatCheckboxModule,
    MatTooltipModule,
    NumberKeyboardComponent,
    CastToNumberPipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './portfolio-trade-dialog.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioTradeDialogComponent {
  form = new FormGroup({
    date: new FormControl(this.lastDateMarketOpen, { validators: [requiredValidator], nonNullable: true }),
    units: new FormControl('', {
      validators: [requiredValidator, minValueValidator(0), positiveNumberValidator],
      nonNullable: true,
    }),
    customTotalValue: new FormControl('', { nonNullable: true }),
    useCustomTotalValueControl: new FormControl(false, { nonNullable: true }),
  });
  keyboardValuesControl = new FormControl('', { nonNullable: true });

  // config for date picker
  datePickerConfig: InputTypeDateTimePickerConfig = {
    maxDate: this.lastDateMarketOpen,
    minDate: new Date(2015, 0, 1),
    dateFilter: dateIsNotWeekend,
  };

  // get holding information for symbol if there is any
  holdingSignal = toSignal(this.portfolioUserFacadeService.getPortfolioStateHolding(this.data.summary.id));
  portfolioState = toSignal(this.portfolioUserFacadeService.getPortfolioState());

  /**
   * load current price or use from summary
   * can be mismatch during the weekend whe loading fails, however quote has the price from friday
   */
  symbolPriceOnDate = toSignal(
    this.form.controls.date.valueChanges.pipe(
      switchMap((date) =>
        this.marketApiService.getHistoricalPricesOnDate(this.data.summary.id, dateFormatDate(date)).pipe(
          tap((d) => console.log('return', d)),
          map((data) => data?.close ?? 0),
        ),
      ),
    ),
    { initialValue: this.data.summary.quote.price },
  );

  /**
   * indicated which form control keyboard should save data
   */
  activeTotalValueButtonSignal = signal<'UNITS' | 'TOTAL_VALUE'>('UNITS');

  isLoadingSignal = signal<boolean>(false);
  /**
   * true if user tries to sell more than he owns
   */
  insufficientUnitsErrorSignal = signal<boolean>(false);
  /**
   * true if user tries to buy more than he has cash
   */
  insufficientCashErrorSignal = signal<boolean>(false);

  USER_HOLDINGS_SYMBOL_LIMIT = USER_HOLDINGS_SYMBOL_LIMIT;

  constructor(
    private dialogRef: MatDialogRef<PortfolioTradeDialogComponent>,
    public authenticationUserService: AuthenticationUserStoreService,
    private portfolioUserFacadeService: PortfolioUserFacadeService,
    private marketApiService: MarketApiService,
    private dialogServiceUtil: DialogServiceUtil,
    @Inject(MAT_DIALOG_DATA) public data: PortfolioTradeDialogComponentData,
  ) {
    this.listenKeyboardChange();
    this.listenCustomTotalValueChange();
    this.listenOnInSufficientUnits();
    this.listenOnInSufficientCash();
  }

  get lastDateMarketOpen(): Date {
    return !isSameDay(new Date(this.data.summary.quote.timestamp * 1000), new Date())
      ? new Date(this.data.summary.quote.timestamp * 1000)
      : new Date();
  }

  get isError(): boolean {
    return this.insufficientUnitsErrorSignal() || this.insufficientCashErrorSignal();
  }

  /**
   * true if user has this symbol in his portfolio or he has not reached the limit of symbols
   */
  allowBuyOperationSignal = computed(() => {
    // check if user will not have more symbols than limit
    const portfolioState = this.portfolioState();
    if (!portfolioState) {
      return true;
    }
    if (this.data.transactionType === 'SELL') {
      return true;
    }
    const userContainSymbol = portfolioState.holdings.map((d) => d.symbol).includes(this.data.summary.id);
    const userHoldingsLimit = portfolioState.holdings.length < USER_HOLDINGS_SYMBOL_LIMIT;
    return userContainSymbol || userHoldingsLimit;
  });

  get isCustomTotal(): boolean {
    return this.form.controls.useCustomTotalValueControl.value;
  }

  get keyboardValue(): string {
    const useUnits = !this.isCustomTotal || this.activeTotalValueButtonSignal() === 'UNITS';
    return useUnits ? this.form.controls.units.value : this.form.controls.customTotalValue.value;
  }

  async onFormSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill in all required fields', 'error');
      return;
    }

    // inform user to add custom total value
    if (this.isCustomTotal && this.form.controls.customTotalValue.value === '') {
      this.dialogServiceUtil.showNotificationBar('Please fill total value', 'error');
      return;
    }

    // create object
    const transactionCreate: PortfolioTransactionCreate = {
      date: dateFormatDate(this.form.controls.date.value),
      symbol: this.data.summary.id,
      units: Number(this.form.controls.units.value),
      customTotalValue: this.isCustomTotal ? Number(this.form.controls.customTotalValue.value) : undefined,
      transactionType: this.data.transactionType,
      symbolType: 'STOCK',
    };

    // set loading
    this.isLoadingSignal.set(true);

    try {
      await this.portfolioUserFacadeService.createTransactionOperation(transactionCreate);
      this.dialogServiceUtil.showNotificationBar('Transaction created', 'success');
      this.dialogRef.close();
    } catch (error) {
      this.dialogServiceUtil.showNotificationBar(String(error), 'error');
      console.log(error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  onActiveTotalValueButtonChange(value: 'UNITS' | 'TOTAL_VALUE'): void {
    this.activeTotalValueButtonSignal.set(value);
  }

  /**
   * reset units and custom total value if user change the useCustomTotalValueControl
   */
  private listenCustomTotalValueChange(): void {
    this.form.controls.useCustomTotalValueControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.controls.units.patchValue('', { emitEvent: false });
      this.form.controls.customTotalValue.patchValue('', { emitEvent: false });
    });
  }

  /**
   * listen to keyboard change and save value to correct form control
   */
  private listenKeyboardChange(): void {
    this.keyboardValuesControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (!this.isCustomTotal || this.activeTotalValueButtonSignal() === 'UNITS') {
        this.form.controls.units.setValue(value);
        return;
      }
      this.form.controls.customTotalValue.setValue(value);
    });
  }

  /**
   * listen to form changes and set insufficient cash error signal
   * if user tries to buy more than he has cash and has portfolio cash active
   */
  private listenOnInSufficientCash(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((form) => {
      if (
        this.data.transactionType === 'SELL' ||
        !this.authenticationUserService.userData.features.userPortfolioAllowCashAccount
      ) {
        return;
      }

      if (this.isCustomTotal) {
        const value = Number(this.form.controls.customTotalValue.value) > (this.portfolioState()?.cashOnHand ?? 0);
        this.insufficientCashErrorSignal.set(value);
      } else {
        const value =
          Number(this.form.controls.units.value) * this.symbolPriceOnDate() > (this.portfolioState()?.cashOnHand ?? 0);
        this.insufficientCashErrorSignal.set(value);
      }
    });
  }

  /**
   * listen to form changes and set insufficient units error signal
   * if user tries to sell more than he owns
   */
  private listenOnInSufficientUnits(): void {
    this.form.controls.units.valueChanges.pipe(takeUntilDestroyed()).subscribe((units) => {
      const value = Number(units) > (this.holdingSignal()?.units ?? 0) && this.data.transactionType === 'SELL';
      this.insufficientUnitsErrorSignal.set(value);
    });
  }
}
