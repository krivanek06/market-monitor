import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MarketApiService } from '@market-monitor/api-client';
import {
  HistoricalPrice,
  SymbolHistoricalPeriods,
  SymbolHistoricalPeriodsArrayPreload,
} from '@market-monitor/api-types';
import { AssetPriceChartComponent, TimePeriodButtonsComponent } from '@market-monitor/shared-components';
import { ClientStylesDirective, DefaultImgDirective } from '@market-monitor/shared-directives';
import { DialogServiceUtil, ErrorEnum } from '@market-monitor/shared-utils-client';
import { catchError, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-asset-price-chart-interactive',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AssetPriceChartComponent,
    TimePeriodButtonsComponent,
    DefaultImgDirective,
    ClientStylesDirective,
  ],
  templateUrl: './asset-price-chart-interactive.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetPriceChartInteractiveComponent implements OnInit, OnChanges {
  @Input({ required: true }) symbol!: string;
  @Input() chartHeightPx = 420;
  @Input() priceName = 'price';
  @Input() priceShowSign = true;
  @Input() title = 'Historical Prices';
  @Input() imageName = '';
  @Input() displayVolume = true;

  loadingSignal = signal<boolean>(true);

  stockHistoricalPrice = signal<HistoricalPrice[]>([]);

  marketApiService = inject(MarketApiService);
  dialogServiceUtil = inject(DialogServiceUtil);
  timePeriodFormControl = new FormControl<SymbolHistoricalPeriods>(SymbolHistoricalPeriods.week, {
    nonNullable: true,
  });

  ngOnInit(): void {
    // load prices by selected time period
    this.timePeriodFormControl.valueChanges
      .pipe(
        startWith(this.timePeriodFormControl.value),
        tap(() => this.stockHistoricalPrice.set([])),
        tap(() => this.loadingSignal.set(true)),
        switchMap((period) =>
          this.marketApiService.getHistoricalPrices(this.symbol, period).pipe(tap(() => this.loadingSignal.set(false))),
        ),
        catchError((err) => {
          console.log(err);
          this.dialogServiceUtil.showNotificationBar(ErrorEnum.CLIENT_GENERAL_ERROR, 'error');
          return [];
        }),
      )
      .subscribe((prices) => {
        this.stockHistoricalPrice.set(prices);
      });

    // preload some data for faster interaction
    SymbolHistoricalPeriodsArrayPreload.forEach((period) => {
      this.marketApiService.getHistoricalPrices(this.symbol, period).subscribe(() => {
        console.log(`Preloaded ${this.symbol} ${period}`);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // trigger time period selection to load prices
    if (changes?.['symbol']?.currentValue) {
      this.timePeriodFormControl.setValue(SymbolHistoricalPeriods.week);
    }
  }
}
