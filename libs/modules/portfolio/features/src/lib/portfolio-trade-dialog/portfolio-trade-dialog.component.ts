import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarketApiService } from '@mm/api-client';
import {
  PortfolioTransactionCreate,
  PortfolioTransactionType,
  SymbolSummary,
  TRANSACTION_FEE_PRCT,
  USER_HOLDINGS_SYMBOL_LIMIT,
  UserAccountEnum,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { minValueValidator, positiveNumberValidator, requiredValidator } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { dateFormatDate, dateIsNotWeekend, roundNDigits } from '@mm/shared/general-util';
import {
  CastToNumberPipe,
  DatePickerComponent,
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
  InputTypeDateTimePickerConfig,
  NumberKeyboardComponent,
} from '@mm/shared/ui';
import { isSameDay } from 'date-fns';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, map, of, pipe, startWith, switchMap } from 'rxjs';
export type PortfolioTradeDialogComponentData = {
  summary: SymbolSummary;
  transactionType: PortfolioTransactionType;
};

@Component({
  selector: 'app-portfolio-trade-dialog',
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
    UserAccountTypeDirective,
  ],
  template: `
    <!-- form -->
    <form [formGroup]="form" (ngSubmit)="onFormSubmit()">
      <mat-dialog-content>
        <div class="flex items-start justify-between pt-5">
          <!-- symbol & image -->
          <div class="flex items-center gap-3 max-w-[70%]">
            <img appDefaultImg imageType="symbol" [src]="data.summary.id" class="w-12 h-12" />
            <div class="flex flex-col">
              <div class="flex items-center gap-4">
                <!-- name -->
                <div class="text-lg text-wt-gray-dark">{{ data.summary.quote.symbol }}</div>
                <span>-</span>
                <!-- operation -->
                <div
                  [ngClass]="{
                    'text-wt-danger': data.transactionType === 'SELL',
                    'text-wt-success': data.transactionType === 'BUY'
                  }"
                >
                  {{ data.transactionType | uppercase }} Operation
                </div>
              </div>
              <div class="hidden md:block">{{ data.summary.quote.name }}</div>
            </div>
          </div>

          <!-- left side -->
          <div>
            <!-- market open state -->
            <div
              [ngClass]="{
                'text-wt-danger': !getIsMarketOpenSignal()?.isTheStockMarketOpen,
                'text-wt-success': !!getIsMarketOpenSignal()?.isTheStockMarketOpen
              }"
              class="mb-1 text-base"
            >
              {{ !getIsMarketOpenSignal()?.isTheStockMarketOpen ? 'Market Closed' : 'Market Open' }}
            </div>

            <!-- if sell, checkbox to sell all -->
            <div *ngIf="data.transactionType === 'SELL'">
              <mat-checkbox (change)="onSellAllClick($event)" color="warn">Sell All</mat-checkbox>
            </div>
          </div>
        </div>

        <ng-container *ngIf="!isLoadingSignal(); else showLoader">
          <!-- date picker -->
          <app-date-picker
            *appUserAccountType="'NORMAL_BASIC'"
            [inputTypeDateTimePickerConfig]="datePickerConfig"
            [formControl]="form.controls.date"
          ></app-date-picker>

          <!-- custom -->
          <div class="flex justify-between pt-3 pb-2">
            <div class="flex items-center gap-3">
              <ng-container *ngIf="isCustomTotal">
                <button
                  mat-flat-button
                  type="button"
                  [color]="activeTotalValueButtonSignal() === 'UNITS' ? 'primary' : ''"
                  (click)="onActiveTotalValueButtonChange('UNITS')"
                >
                  Change Units
                </button>
                <button
                  mat-flat-button
                  type="button"
                  [color]="activeTotalValueButtonSignal() === 'TOTAL_VALUE' ? 'primary' : ''"
                  (click)="onActiveTotalValueButtonChange('TOTAL_VALUE')"
                >
                  Change Total Value
                </button>
              </ng-container>
            </div>

            <!-- custom total value -->
            <mat-checkbox
              *appUserAccountType="'NORMAL_BASIC'"
              matTooltip="Add Custom Value"
              color="primary"
              [formControl]="form.controls.useCustomTotalValueControl"
            >
              Custom
            </mat-checkbox>
          </div>

          <!-- info -->
          <div class="flex flex-col p-3 mb-1">
            <div class="g-item-wrapper">
              <span>Date</span>
              <span>{{ form.controls.date.value | date: 'MMMM d, y (EEEE)' }}</span>
            </div>
            <div class="g-item-wrapper">
              <span>Owned Units</span>
              <span>{{ holdingSignal()?.units ?? 0 }}</span>
            </div>
            <div *appUserAccountType="'DEMO_TRADING'" class="g-item-wrapper">
              <span [ngClass]="{ 'text-wt-danger': insufficientCashErrorSignal() }">Cash on Hand</span>
              <span [ngClass]="{ 'text-wt-danger': insufficientCashErrorSignal() }">
                {{ portfolioState()?.cashOnHand | currency }}
              </span>
            </div>
            <div *ngIf="!isCustomTotal" class="g-item-wrapper">
              <span>Price</span>
              <span>{{ symbolPriceOnDate() | currency }}</span>
            </div>
            <div class="g-item-wrapper">
              <div [ngClass]="{ 'text-wt-danger': insufficientUnitsErrorSignal() }">Units</div>
              <div [ngClass]="{ 'text-wt-danger': insufficientUnitsErrorSignal() }" class="flex items-center gap-4">
                <!-- remove units -->
                <button mat-icon-button type="button" (click)="onIncreaseUnits(-1)">
                  <mat-icon>remove</mat-icon>
                </button>
                <!-- units -->
                <span>{{ form.controls.units.value || 0 }}</span>
                <!-- add units -->
                <button mat-icon-button type="button" (click)="onIncreaseUnits(1)">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>
            <div class="g-item-wrapper">
              <div class="space-x-2">
                <span>Total Value</span>
                <span *ngIf="isDemoTradingAccount()">/</span>
                <span *ngIf="isDemoTradingAccount()">Fees</span>
              </div>
              <div class="space-x-2">
                @if (!isCustomTotal) {
                  <span>{{ symbolPriceOnDate() * (form.controls.units.value | castToNumber) | currency }}</span>
                  <span *ngIf="isDemoTradingAccount()">/</span>
                  <span *ngIf="isDemoTradingAccount()"> ~{{ calculatedFees() | currency }} </span>
                } @else {
                  <span> {{ form.controls.customTotalValue.value || 0 | currency }} </span>
                }
              </div>
            </div>
          </div>

          <!-- errors -->
          <div class="flex flex-col gap-4 mb-7">
            <div class="g-banner-error" *ngIf="insufficientUnitsErrorSignal() || isSellDisabledZeroUnits()">
              Insufficient units to sell
            </div>
            <div class="g-banner-error" *ngIf="insufficientCashErrorSignal()">Insufficient cash amount on hand</div>
            <div class="g-banner-error" *ngIf="!allowBuyOperationSignal()">
              Your Portfolio can contain maximum {{ USER_HOLDINGS_SYMBOL_LIMIT }} symbols
            </div>
          </div>

          <!-- units / keyboard -->
          <div class="md:px-3">
            <!-- units keyboard -->
            <app-number-keyboard-control
              *ngIf="activeTotalValueButtonSignal() === 'UNITS'"
              [formControl]="form.controls.units"
            />

            <!-- custom total keyboard -->
            <app-number-keyboard-control
              *ngIf="activeTotalValueButtonSignal() === 'TOTAL_VALUE'"
              [formControl]="form.controls.customTotalValue"
            />
          </div>
        </ng-container>

        <!-- loader -->
        <ng-template #showLoader>
          <div class="grid py-16 place-content-center">
            <mat-spinner [diameter]="100"></mat-spinner>
          </div>
        </ng-template>
      </mat-dialog-content>

      <div class="my-4">
        <mat-divider></mat-divider>
      </div>

      <mat-dialog-actions>
        <div class="g-mat-dialog-actions-full">
          <button mat-flat-button mat-dialog-close type="button">Cancel</button>
          <button
            [disabled]="
              isLoadingSignal() ||
              isError ||
              !allowBuyOperationSignal() ||
              isSellDisabledZeroUnits() ||
              !form.controls.units.value
            "
            type="submit"
            mat-flat-button
            [color]="data.transactionType === 'BUY' ? 'accent' : 'warn'"
          >
            Save
          </button>
        </div>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioTradeDialogComponent {
  private dialogRef = inject(MatDialogRef<PortfolioTradeDialogComponent>);
  private portfolioUserFacadeService = inject(PortfolioUserFacadeService);
  private marketApiService = inject(MarketApiService);
  private dialogServiceUtil = inject(DialogServiceUtil);
  authenticationUserService = inject(AuthenticationUserStoreService);
  data = inject<PortfolioTradeDialogComponentData>(MAT_DIALOG_DATA);

  form = new FormGroup({
    date: new FormControl(this.lastDateMarketOpen, { validators: [requiredValidator], nonNullable: true }),
    units: new FormControl('', {
      validators: [requiredValidator, minValueValidator(0), positiveNumberValidator],
      nonNullable: true,
    }),
    customTotalValue: new FormControl('', { nonNullable: true }),
    useCustomTotalValueControl: new FormControl(false, { nonNullable: true }),
  });

  // config for date picker
  datePickerConfig: InputTypeDateTimePickerConfig = {
    maxDate: this.lastDateMarketOpen,
    minDate: new Date(2015, 0, 1),
    dateFilter: dateIsNotWeekend,
  };

  // get holding information for symbol if there is any
  holdingSignal = this.portfolioUserFacadeService.getPortfolioStateHolding(this.data.summary.id);
  portfolioState = this.portfolioUserFacadeService.getPortfolioState;
  getIsMarketOpenSignal = this.marketApiService.getIsMarketOpenSignal;
  /**
   * load current price or use from summary
   * can be mismatch during the weekend whe loading fails, however quote has the price from friday
   */
  symbolPriceOnDate = toSignal(
    this.form.controls.date.valueChanges.pipe(
      switchMap((date) =>
        this.marketApiService.getHistoricalPricesOnDate(this.data.summary.id, dateFormatDate(date)).pipe(
          map((data) => data?.close ?? 0),
          catchError((e) => {
            this.dialogServiceUtil.handleError(e);
            return of(0);
          }),
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
  isSellDisabledZeroUnits = computed(() => !this.holdingSignal() && this.data.transactionType === 'SELL');

  userDataSignal = this.authenticationUserService.state.getUserData;

  isDemoTradingAccount = computed(() => this.authenticationUserService.state.isAccountDemoTrading());
  calculatedFees = computedFrom(
    [
      this.form.controls.units.valueChanges.pipe(
        startWith(this.form.controls.units.value),
        map((d) => Number(d)),
      ),
      this.symbolPriceOnDate,
    ],
    pipe(map(([units, price]) => roundNDigits(((units * price) / 100) * TRANSACTION_FEE_PRCT))),
    { initialValue: 0 },
  );

  USER_HOLDINGS_SYMBOL_LIMIT = USER_HOLDINGS_SYMBOL_LIMIT;

  constructor() {
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

  /**
   * if true user can enter custom total value
   */
  get isCustomTotal(): boolean {
    return this.form.controls.useCustomTotalValueControl.value;
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
      date: dateFormatDate(this.form.controls.date.value, 'yyyy-MM-dd HH:mm:ss'),
      symbol: this.data.summary.id,
      units: Number(this.form.controls.units.value),
      customTotalValue: this.isCustomTotal ? Number(this.form.controls.customTotalValue.value) : undefined,
      transactionType: this.data.transactionType,
      symbolType: 'STOCK',
    };

    // set loading
    this.isLoadingSignal.set(true);

    try {
      await this.portfolioUserFacadeService.createPortfolioOperation(transactionCreate);
      this.dialogServiceUtil.showNotificationBar('Transaction created', 'success');
      this.dialogRef.close();
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  onActiveTotalValueButtonChange(value: 'UNITS' | 'TOTAL_VALUE'): void {
    this.activeTotalValueButtonSignal.set(value);
  }

  onSellAllClick(event: MatCheckboxChange): void {
    if (event.checked) {
      this.form.controls.units.patchValue(String(this.holdingSignal()?.units ?? 0));
    } else {
      this.form.controls.units.patchValue('');
    }
  }

  onIncreaseUnits(value: number): void {
    const currentVal = Number(this.form.controls.units.value);
    // prevent negative values
    if (currentVal + value < 0) {
      return;
    }
    // increase or decrease units
    this.form.controls.units.patchValue(String(Number(this.form.controls.units.value) + value));
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
   * listen to form changes and set insufficient cash error signal
   * if user tries to buy more than he has cash and has portfolio cash active
   */
  private listenOnInSufficientCash(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      // no error is selling or no portfolio cash account
      if (
        this.data.transactionType === 'SELL' ||
        this.userDataSignal().userAccountType !== UserAccountEnum.DEMO_TRADING
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
