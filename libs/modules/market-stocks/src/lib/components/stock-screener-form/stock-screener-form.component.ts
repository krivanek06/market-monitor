import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
} from '../../models';

@Component({
  selector: 'app-stock-screener-form',
  standalone: true,
  imports: [CommonModule, FormMatInputWrapperComponent, ReactiveFormsModule],
  templateUrl: './stock-screener-form.component.html',
  styleUrls: ['./stock-screener-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockScreenerFormComponent {
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
    marketCap: new FormControl<StockScreenerArray>([null, null]),
    price: new FormControl<StockScreenerArray>([null, null]),
    volume: new FormControl<StockScreenerArray>([null, null]),
    dividends: new FormControl<StockScreenerArray>([null, null]),
  });
}
