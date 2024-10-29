import { CurrencyPipe, DatePipe, NgClass, UpperCasePipe } from '@angular/common';
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
import {
  OutstandingOrder,
  PortfolioStateHoldings,
  PortfolioTransactionType,
  SymbolQuote,
  TRANSACTION_FEE_PRCT,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { minValueValidator, positiveNumberValidator, requiredValidator } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { createUUID, getCurrentDateDetailsFormat, roundNDigits, transformUserToBaseMin } from '@mm/shared/general-util';
import {
  DefaultImgDirective,
  DialogCloseHeaderComponent,
  FormMatInputWrapperComponent,
  NumberKeyboardComponent,
} from '@mm/shared/ui';
import { map, startWith } from 'rxjs';

export type PortfolioTradeDialogComponentData = {
  quote: SymbolQuote;
  transactionType: PortfolioTransactionType;
  isMarketOpen: boolean;
  sector?: string;
  userPortfolioStateHolding?: PortfolioStateHoldings;
};

@Component({
  selector: 'app-portfolio-trade-dialog',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    CurrencyPipe,
    UpperCasePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DialogCloseHeaderComponent,
    MatDividerModule,
    ReactiveFormsModule,
    FormMatInputWrapperComponent,
    DefaultImgDirective,
    MatCheckboxModule,
    MatTooltipModule,
    NumberKeyboardComponent,
    MatProgressSpinnerModule,
    UserAccountTypeDirective,
  ],
  template: `
    <!-- form -->
    <form [formGroup]="form" (ngSubmit)="onFormSubmit()">
      <mat-dialog-content>
        <div class="flex items-start justify-between gap-y-2 pt-5">
          <!-- right side - symbol & image -->
          <div class="flex max-w-[70%] items-center gap-3">
            <img appDefaultImg imageType="symbol" [src]="data().quote.symbol" class="h-8 w-8 md:h-12 md:w-12" />
            <div class="flex flex-col">
              <div class="flex flex-col gap-x-4 md:flex-row md:items-center">
                <!-- name -->
                <div class="text-wt-gray-dark text-lg">{{ data().quote.symbol }}</div>
                <span class="hidden md:block">-</span>
                <!-- operation -->
                <div
                  [ngClass]="{
                    'text-wt-danger': data().transactionType === 'SELL',
                    'text-wt-success': data().transactionType === 'BUY',
                  }"
                >
                  {{ data().transactionType | uppercase }} <span class="max-lg:hidden">Operation</span>
                </div>
              </div>
              <div class="hidden md:block">{{ data().quote.name }}</div>
            </div>
          </div>

          <!-- left side -->
          <div>
            <!-- market open state -->
            <div
              [ngClass]="{
                'text-wt-danger': !data().isMarketOpen,
                'text-wt-success': data().isMarketOpen,
              }"
              class="mb-1 text-end text-base"
            >
              {{ !data().isMarketOpen ? 'Market Closed' : 'Market Open' }}
            </div>

            <!-- if sell, checkbox to sell all -->
            @if (data().transactionType === 'SELL') {
              <mat-checkbox data-testid="trade-dialog-sell-all-checkbox" (change)="onSellAllClick($event)" color="warn">
                Sell All
              </mat-checkbox>
            } @else {
              <!-- custom -->
              <div class="flex justify-around gap-4">
                <mat-checkbox
                  data-testid="trade-dialog-units-keyboard-checkbox"
                  [color]="!useCustomTotalValue ? 'primary' : ''"
                  (click)="onActiveTotalValueButtonChange('UNITS')"
                  [checked]="!useCustomTotalValue"
                  [disabled]="!useCustomTotalValue"
                >
                  Units
                </mat-checkbox>
                <mat-checkbox
                  data-testid="trade-dialog-value-keyboard-checkbox"
                  [color]="useCustomTotalValue ? 'primary' : ''"
                  (click)="onActiveTotalValueButtonChange('TOTAL_VALUE')"
                  [checked]="useCustomTotalValue"
                  [disabled]="useCustomTotalValue"
                >
                  Custom Value
                </mat-checkbox>
              </div>
            }
          </div>
        </div>

        <!-- info -->
        <div class="mb-1 flex flex-col p-3">
          <!-- execution date -->
          <div class="g-item-wrapper">
            <span>Date</span>
            <span>{{ data().quote.timestamp * 1000 | date: 'MMMM d, y (EEEE)' }}</span>
          </div>

          <!-- units owned -->
          <div class="g-item-wrapper">
            <span>Owned Units</span>
            <span>{{ holdingSignal()?.units ?? 0 }}</span>
          </div>

          <!-- cash on hand -->
          <div class="g-item-wrapper">
            <span [ngClass]="{ 'text-wt-danger': insufficientCashErrorSignal() }">Cash on Hand</span>
            <span [ngClass]="{ 'text-wt-danger': insufficientCashErrorSignal() }">
              {{ data().userPortfolioStateHolding?.cashOnHand ?? 0 | currency }}
            </span>
          </div>

          <!-- price -->
          <div class="g-item-wrapper">
            <span>Price</span>
            <span>{{ data().quote.price | currency }}</span>
          </div>

          <!-- units -->
          <div class="g-item-wrapper">
            <div [ngClass]="{ 'text-wt-danger': insufficientUnitsErrorSignal() }">Units</div>
            <div [ngClass]="{ 'text-wt-danger': insufficientUnitsErrorSignal() }" class="flex items-center gap-4">
              <!-- remove units -->
              @if (!useCustomTotalValue) {
                <button
                  data-testid="trade-dialog-decrement-units"
                  mat-icon-button
                  type="button"
                  (click)="onIncreaseUnits(-1)"
                >
                  <mat-icon>remove</mat-icon>
                </button>
              }
              <!-- units -->
              @if (data().transactionType === 'BUY') {
                <span>{{ form.controls.units.value || 0 }} / {{ maximumUnitsToBuy() }}</span>
              } @else {
                <span>{{ form.controls.units.value || 0 }}</span>
              }
              <!-- add units -->
              @if (!useCustomTotalValue) {
                <button
                  data-testid="trade-dialog-increment-units"
                  mat-icon-button
                  type="button"
                  (click)="onIncreaseUnits(1)"
                >
                  <mat-icon>add</mat-icon>
                </button>
              }
            </div>
          </div>

          <!-- custom total value -->
          @if (useCustomTotalValue) {
            <div class="g-item-wrapper">
              <span>Custom Price</span>
              <span>{{ form.controls.customTotalValue.value | currency }}</span>
            </div>
          }

          <!-- calculated total value -->
          <div class="g-item-wrapper">
            <div class="space-x-2">
              <span>Total Value</span>
              <span>/</span>
              <span>Fees</span>
            </div>
            <div class="space-x-2">
              <span>{{ data().quote.price * form.controls.units.value | currency }}</span>
              <span>/</span>
              <span> ~{{ calculatedFees() | currency }} </span>
            </div>
          </div>
        </div>

        <!-- errors -->
        <div class="mb-7 flex flex-col gap-4">
          @if (insufficientUnitsErrorSignal() || isSellDisabledZeroUnits()) {
            <div data-testid="trade-dialog-insufficient-units-error" class="g-banner-error">
              Insufficient units to sell
            </div>
          }
          @if (insufficientCashErrorSignal()) {
            <div data-testid="trade-dialog-insufficient-cash-error" class="g-banner-error">
              Insufficient cash amount on hand
            </div>
          }
        </div>

        <!-- units / keyboard -->
        <div class="md:px-3">
          @if (useCustomTotalValue) {
            <!-- custom total keyboard -->
            <app-number-keyboard-control [formControl]="form.controls.customTotalValue" />
          } @else {
            <!-- units keyboard -->
            <app-number-keyboard-control
              [formControl]="form.controls.units"
              [enableDecimal]="isSymbolCrypto()"
              [decimalLimit]="isSymbolCrypto() ? 4 : 0"
            />
          }
        </div>
      </mat-dialog-content>

      <div class="my-4">
        <mat-divider />
      </div>

      <mat-dialog-actions>
        <div class="g-mat-dialog-actions-full">
          <button mat-flat-button mat-dialog-close type="button">Cancel</button>
          <button
            data-testid="trade-dialog-save-button"
            [disabled]="disabledSubmit() || !form.controls.units.value || form.controls.units.value === 0"
            type="submit"
            mat-flat-button
            [color]="data().transactionType === 'BUY' ? 'accent' : 'warn'"
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
  private readonly dialogRef = inject(MatDialogRef<PortfolioTradeDialogComponent, OutstandingOrder | undefined>);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly authenticationUserService = inject(AuthenticationUserStoreService);
  readonly data = signal(inject<PortfolioTradeDialogComponentData>(MAT_DIALOG_DATA));

  readonly form = new FormGroup({
    units: new FormControl(0, {
      validators: [requiredValidator, minValueValidator(0), positiveNumberValidator],
      nonNullable: true,
    }),
    // user can set how much he wants to spend and it will calculate units
    customTotalValue: new FormControl(0, { nonNullable: true }),
    // whether user wants to use custom total value and custom units
    useCustomTotalValueControl: new FormControl(false, { nonNullable: true }),
  });

  // get holding information for symbol if there is any
  readonly holdingSignal = computed(() => {
    const symbol = this.data().quote.symbol;
    return this.data().userPortfolioStateHolding?.holdings.find((holding) => holding.symbol === symbol);
  });
  readonly userDataSignal = this.authenticationUserService.state.getUserData;

  readonly isSymbolCrypto = computed(() => this.data().quote.exchange === 'CRYPTO');

  /**
   * true if user tries to sell more than he owns
   */
  readonly insufficientUnitsErrorSignal = toSignal(
    this.form.controls.units.valueChanges.pipe(
      map((units) => units > (this.holdingSignal()?.units ?? 0) && this.data().transactionType === 'SELL'),
    ),
    { initialValue: false },
  );

  /**
   * true if user tries to buy more than he has cash
   */
  readonly insufficientCashErrorSignal = toSignal(
    this.form.valueChanges.pipe(
      map(() => {
        const data = this.data();
        // no error if selling
        if (data.transactionType === 'SELL') {
          return false;
        }

        // check if user has enough cash to buy
        const value =
          this.form.controls.units.value * data.quote.price > (this.data().userPortfolioStateHolding?.cashOnHand ?? 0);
        return value;
      }),
    ),
    { initialValue: false },
  );

  /**
   * if operation is SELL, user can't sell 0 units
   */
  readonly isSellDisabledZeroUnits = computed(() => !this.holdingSignal() && this.data().transactionType === 'SELL');
  readonly calculatedFees = toSignal(
    this.form.controls.units.valueChanges.pipe(
      startWith(this.form.controls.units.value),
      map((units) => roundNDigits(((units * this.data().quote.price) / 100) * TRANSACTION_FEE_PRCT)),
    ),
    { initialValue: 0 },
  );

  readonly disabledSubmit = computed(
    () => this.insufficientUnitsErrorSignal() || this.insufficientCashErrorSignal() || this.isSellDisabledZeroUnits(),
  );

  readonly maximumUnitsToBuy = computed(() => {
    const cashOnHand = this.data().userPortfolioStateHolding?.cashOnHand ?? 0;
    const price = this.data().quote.price;
    const isCrypto = this.isSymbolCrypto();

    // if crypto, we can buy fraction of units
    if (isCrypto) {
      return roundNDigits(cashOnHand / price, 4);
    }

    // prevent fractional units
    return Math.floor(cashOnHand / price);
  });

  get useCustomTotalValue(): boolean {
    return this.form.controls.useCustomTotalValueControl.value;
  }

  constructor() {
    this.listenCustomTotalValueChange();
    this.listenOnCustomCustomValueChange();
  }

  async onFormSubmit(): Promise<void> {
    // form is probably never invalid
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill in all required fields', 'error');
      return;
    }

    // if whatever error is present, we can't submit
    if (this.disabledSubmit()) {
      this.dialogServiceUtil.showNotificationBar('You can not perform action', 'error');
      return;
    }

    // create object
    const data = this.data();

    // create order
    const order: OutstandingOrder = {
      orderId: createUUID(),
      createdAt: getCurrentDateDetailsFormat(),
      symbol: data.quote.symbol,
      displaySymbol: data.quote.displaySymbol,
      sector: data.sector ?? 'Unknown',
      symbolType: data.quote.exchange === 'CRYPTO' ? 'CRYPTO' : 'STOCK',
      units: this.form.controls.units.value,
      potentialSymbolPrice: data.quote.price,
      potentialTotalPrice: roundNDigits(data.quote.price * this.form.controls.units.value),
      userData: transformUserToBaseMin(this.userDataSignal()),
      orderType: this.getOrderType(),
      status: 'OPEN',
    };

    // close dialog
    this.dialogRef.close(order);
  }

  private getOrderType(): OutstandingOrder['orderType'] {
    if (this.data().transactionType === 'SELL') {
      return {
        type: 'SELL',
      };
    }

    return {
      type: 'BUY',
    };
  }

  onActiveTotalValueButtonChange(value: 'UNITS' | 'TOTAL_VALUE'): void {
    const isCustom = value === 'TOTAL_VALUE';
    this.form.controls.useCustomTotalValueControl.patchValue(isCustom);
  }

  onSellAllClick(event: MatCheckboxChange): void {
    const val = event.checked ? (this.holdingSignal()?.units ?? 0) : 0;
    this.form.controls.units.patchValue(val);
  }

  onIncreaseUnits(value: number): void {
    const currentVal = this.form.controls.units.value;
    // prevent negative values
    if (currentVal + value < 0) {
      this.form.controls.units.patchValue(0);
      return;
    }
    // increase or decrease units
    this.form.controls.units.patchValue(this.form.controls.units.value + value);
  }

  /**
   * reset units and custom total value if user change the useCustomTotalValueControl
   */
  private listenCustomTotalValueChange(): void {
    this.form.controls.useCustomTotalValueControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.controls.units.patchValue(0, { emitEvent: false });
      this.form.controls.customTotalValue.patchValue(0, { emitEvent: false });
    });
  }

  /**
   * whenever custom total value changes, we need to update the units based on cash on hand
   */
  private listenOnCustomCustomValueChange(): void {
    this.form.controls.customTotalValue.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const units = value / this.data().quote.price;
      const unitsRound = this.isSymbolCrypto() ? roundNDigits(units, 4) : Math.floor(units);
      this.form.controls.units.patchValue(unitsRound);
    });
  }
}
