import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import {
  StockExchangeTypes,
  StockIndustryTypes,
  StockScreenerArray,
  StockScreenerValues,
  StockSectorTypes,
} from '@mm/api-types';
import {
  STOCK_SCREENER_COUNTRIES,
  STOCK_SCREENER_DIVIDENDS,
  STOCK_SCREENER_EXCHANGE,
  STOCK_SCREENER_INDUSTRIES,
  STOCK_SCREENER_MARKET_CAP,
  STOCK_SCREENER_PRICE,
  STOCK_SCREENER_SECTORS,
  STOCK_SCREENER_VOLUME,
} from '@mm/market-stocks/data-access';
import { DropdownControlComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-screener-form-control',
  standalone: true,
  imports: [CommonModule, DropdownControlComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="screenerFormGroup" class="grid xs:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
      <!-- market cap. -->
      <app-dropdown-control
        formControlName="marketCap"
        inputCaption="Market Cap."
        [inputSource]="STOCK_SCREENER_MARKET_CAP"
      />

      <!-- price -->
      <app-dropdown-control formControlName="price" inputCaption="Price" [inputSource]="STOCK_SCREENER_PRICE" />

      <!-- volume -->
      <app-dropdown-control formControlName="volume" inputCaption="Volume" [inputSource]="STOCK_SCREENER_VOLUME" />

      <!-- dividends -->
      <app-dropdown-control
        class="hidden md:block"
        formControlName="dividends"
        inputCaption="Dividends"
        [inputSource]="STOCK_SCREENER_DIVIDENDS"
      />

      <!-- sector -->
      <app-dropdown-control formControlName="sector" inputCaption="Sector" [inputSource]="STOCK_SCREENER_SECTORS" />

      <!-- industries -->
      <app-dropdown-control
        class="hidden md:block"
        formControlName="industry"
        inputCaption="Industry"
        [inputSource]="STOCK_SCREENER_INDUSTRIES"
      />

      <!-- exchange -->
      <app-dropdown-control
        class="hidden md:block"
        formControlName="exchange"
        inputCaption="Exchange"
        [inputSource]="STOCK_SCREENER_EXCHANGE"
      />

      <!-- countries -->
      <app-dropdown-control
        class="hidden md:block"
        formControlName="country"
        inputCaption="Country"
        [inputSource]="STOCK_SCREENER_COUNTRIES"
      />
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
    marketCap: new FormControl<StockScreenerArray | null>(STOCK_SCREENER_MARKET_CAP[1].value),
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
