import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
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
import { PortfolioTransactionType, SymbolSummary } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
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
    date: new FormControl(new Date(), { validators: [requiredValidator], nonNullable: true }),
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
    maxDate: new Date(),
    minDate: new Date(2015, 0, 1),
    dateFilter: dateIsNotWeekend,
  };

  userSettings = this.authenticationUserService.userSettings;

  // get holding information for symbol if there is any
  holdingSignal = toSignal(this.portfolioUserFacadeService.getPortfolioStateHolding(this.data.summary.id));
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

  constructor(
    private dialogRef: MatDialogRef<PortfolioTradeDialogComponent>,
    private authenticationUserService: AuthenticationUserService,
    private portfolioUserFacadeService: PortfolioUserFacadeService,
    private marketApiService: MarketApiService,
    private dialogServiceUtil: DialogServiceUtil,
    @Inject(MAT_DIALOG_DATA) public data: PortfolioTradeDialogComponentData,
  ) {
    this.form.valueChanges.subscribe(console.log);
    this.listenKeyboardChange();
    this.listenCustomTotalValueChange();
  }

  get isCustomTotal(): boolean {
    return this.form.controls.useCustomTotalValueControl.value;
  }

  get keyboardValue(): string {
    const useUnits = !this.isCustomTotal || this.activeTotalValueButtonSignal() === 'UNITS';
    return useUnits ? this.form.controls.units.value : this.form.controls.customTotalValue.value;
  }

  onFormSubmit(): void {
    console.log('submitting');
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill in all required fields', 'error');
      return;
    }

    // inform user to add custom total value
    if (this.isCustomTotal && this.form.controls.customTotalValue.value === '') {
      this.dialogServiceUtil.showNotificationBar('Please fill total value', 'error');
      return;
    }

    // todo: check if user has enough cash to buy this stock

    // create object
    const transaction: PortfolioTransactionCreate = {
      date: this.form.controls.date.value.toISOString(),
      symbol: this.data.summary.id,
      units: Number(this.form.controls.units.value),
      customTotalValue: this.isCustomTotal ? Number(this.form.controls.customTotalValue.value) : undefined,
      transactionType: this.data.transactionType,
      symbolType: 'STOCK',
    };

    console.log('transaction', transaction);

    // TODO subtract from cash if enabled
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
}
