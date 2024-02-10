import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import {
  StockExchangeTypes,
  StockIndustryTypes,
  StockScreenerArray,
  StockScreenerValues,
  StockSectorTypes,
} from '@market-monitor/api-types';
import {
  STOCK_SCREENER_COUNTRIES,
  STOCK_SCREENER_DIVIDENDS,
  STOCK_SCREENER_EXCHANGE,
  STOCK_SCREENER_INDUSTRIES,
  STOCK_SCREENER_MARKET_CAP,
  STOCK_SCREENER_PRICE,
  STOCK_SCREENER_SECTORS,
  STOCK_SCREENER_VOLUME,
} from '@market-monitor/modules/market-stocks/data-access';
import { FormMatInputWrapperComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-stock-screener-form-control',
  standalone: true,
  imports: [CommonModule, FormMatInputWrapperComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="screenerFormGroup" class="grid xs:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
      <!-- market cap. -->
      <app-form-mat-input-wrapper
        formControlName="marketCap"
        inputCaption="Market Cap."
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_MARKET_CAP"
      ></app-form-mat-input-wrapper>

      <!-- price -->
      <app-form-mat-input-wrapper
        formControlName="price"
        inputCaption="Price"
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_PRICE"
      ></app-form-mat-input-wrapper>

      <!-- volume -->
      <app-form-mat-input-wrapper
        formControlName="volume"
        inputCaption="Volume"
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_VOLUME"
      ></app-form-mat-input-wrapper>

      <!-- dividends -->
      <app-form-mat-input-wrapper
        class="hidden md:block"
        formControlName="dividends"
        inputCaption="Dividends"
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_DIVIDENDS"
      ></app-form-mat-input-wrapper>

      <!-- sector -->
      <app-form-mat-input-wrapper
        formControlName="sector"
        inputCaption="Sector"
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_SECTORS"
      ></app-form-mat-input-wrapper>

      <!-- industries -->
      <app-form-mat-input-wrapper
        class="hidden md:block"
        formControlName="industry"
        inputCaption="Industry"
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_INDUSTRIES"
      ></app-form-mat-input-wrapper>

      <!-- exchange -->
      <app-form-mat-input-wrapper
        class="hidden md:block"
        formControlName="exchange"
        inputCaption="Exchange"
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_EXCHANGE"
      ></app-form-mat-input-wrapper>

      <!-- countries -->
      <app-form-mat-input-wrapper
        class="hidden md:block"
        formControlName="country"
        inputCaption="Country"
        inputType="SELECT"
        [inputSource]="STOCK_SCREENER_COUNTRIES"
      ></app-form-mat-input-wrapper>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StockScreenerFormControlComponent),
      multi: true,
    },
  ],
  styles: `
      :host {
        display: block;
      }
    `,
})
export class StockScreenerFormControlComponent implements OnInit, ControlValueAccessor {
  STOCK_SCREENER_COUNTRIES = STOCK_SCREENER_COUNTRIES;
  STOCK_SCREENER_INDUSTRIES = STOCK_SCREENER_INDUSTRIES;
  STOCK_SCREENER_SECTORS = STOCK_SCREENER_SECTORS;
  STOCK_SCREENER_EXCHANGE = STOCK_SCREENER_EXCHANGE;

  STOCK_SCREENER_MARKET_CAP = STOCK_SCREENER_MARKET_CAP;
  STOCK_SCREENER_PRICE = STOCK_SCREENER_PRICE;
  STOCK_SCREENER_VOLUME = STOCK_SCREENER_VOLUME;
  STOCK_SCREENER_DIVIDENDS = STOCK_SCREENER_DIVIDENDS;

  screenerFormGroup = new FormGroup({
    country: new FormControl<string | null>(null),
    industry: new FormControl<StockIndustryTypes | null>(null),
    sector: new FormControl<StockSectorTypes | null>(null),
    exchange: new FormControl<StockExchangeTypes | null>(null),
    marketCap: new FormControl<StockScreenerArray | null>(null),
    price: new FormControl<StockScreenerArray | null>(null),
    volume: new FormControl<StockScreenerArray | null>(null),
    dividends: new FormControl<StockScreenerArray | null>(null),
  });

  onChange: (value: StockScreenerValues) => void = () => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.screenerFormGroup.valueChanges.subscribe(() => {
      const values = this.screenerFormGroup.getRawValue();
      this.onChange(values);
    });
  }

  writeValue(obj: StockScreenerValues): void {
    this.screenerFormGroup.patchValue(obj, { emitEvent: false });
  }
  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: StockScreenerFormControlComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: StockScreenerFormControlComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
