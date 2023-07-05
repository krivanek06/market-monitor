import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FormMatInputWrapperComponent } from '@market-monitor/shared-components';
import {
  STOCK_SCREENER_COUNTRIES,
  STOCK_SCREENER_DIVIDENDS,
  STOCK_SCREENER_EXCHANGE,
  STOCK_SCREENER_INDUSTRIES,
  STOCK_SCREENER_MARKET_CAP,
  STOCK_SCREENER_PRICE,
  STOCK_SCREENER_SECTORS,
  STOCK_SCREENER_VOLUME,
  StockScreenerArray,
  StockScreenerFormValues,
} from '../../models';

@Component({
  selector: 'app-stock-screener-form',
  standalone: true,
  imports: [CommonModule, FormMatInputWrapperComponent, ReactiveFormsModule],
  templateUrl: './stock-screener-form.component.html',
  styleUrls: ['./stock-screener-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StockScreenerFormComponent),
      multi: true,
    },
  ],
})
export class StockScreenerFormComponent implements OnInit, ControlValueAccessor {
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
    industry: new FormControl<string | null>(null),
    sector: new FormControl<string | null>(null),
    exchange: new FormControl<string | null>(null),
    marketCap: new FormControl<StockScreenerArray | null>(null),
    price: new FormControl<StockScreenerArray | null>(null),
    volume: new FormControl<StockScreenerArray | null>(null),
    dividends: new FormControl<StockScreenerArray | null>(null),
  });

  onChange: (value: StockScreenerFormValues) => void = () => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.screenerFormGroup.valueChanges.subscribe(() => {
      const values = this.screenerFormGroup.getRawValue();
      this.onChange(values);
    });
  }

  writeValue(obj: StockScreenerFormValues): void {
    this.screenerFormGroup.patchValue(obj, { emitEvent: false });
  }
  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: StockScreenerFormComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: StockScreenerFormComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
