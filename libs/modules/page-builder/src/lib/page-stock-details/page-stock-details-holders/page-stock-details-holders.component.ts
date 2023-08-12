import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MarketApiService } from '@market-monitor/api-client';
import { MarketDataTransformService } from '@market-monitor/modules/market-general';
import {
  StockOwnershipHoldersTableComponent,
  StockOwnershipInstitutionalListComponent,
} from '@market-monitor/modules/market-stocks';
import { FormMatInputWrapperComponent, GeneralCardComponent } from '@market-monitor/shared-components';
import { RangeDirective } from '@market-monitor/shared-directives';
import { getPreviousDate, isStockMarketClosedDate } from '@market-monitor/shared-utils-general';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-holders',
  standalone: true,
  imports: [
    CommonModule,
    StockOwnershipInstitutionalListComponent,
    StockOwnershipHoldersTableComponent,
    GeneralCardComponent,
    FormMatInputWrapperComponent,
    ReactiveFormsModule,
    RangeDirective,
  ],
  templateUrl: './page-stock-details-holders.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsHoldersComponent extends PageStockDetailsBase {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);

  quarterFormControl = new FormControl<string | null>(null);
  loadingSignal = signal(false);

  quarterFormControlSignal = toSignal(this.quarterFormControl.valueChanges);
  ownershipInstitutionalSignal = toSignal(
    this.stocksApiService.getStockOwnershipInstitutional(this.stockSymbolSignal()),
  );
  ownershipHoldersToDateSignal = toSignal(
    this.quarterFormControl.valueChanges.pipe(
      filter((data): data is string => !!data),
      tap(() => this.loadingSignal.set(true)),
      switchMap((quarter) =>
        this.stocksApiService
          .getStockOwnershipHoldersToDate(this.stockSymbolSignal(), quarter)
          .pipe(tap(() => this.loadingSignal.set(false))),
      ),
    ),
  );
  institutionalPortfolioInputSourceSignal = toSignal(
    this.marketApiService.getInstitutionalPortfolioDates().pipe(
      map((d) => this.marketDataTransformService.transformDatesIntoInputSource(d)),
      tap((data) => this.quarterFormControl.setValue(data[0].value)),
    ),
  );
  historicalPriceOnDateSignal = toSignal(
    this.quarterFormControl.valueChanges.pipe(
      filter((data): data is string => !!data),
      // if date is YYYY-12-31 then it is a closed date -> subtract 1 day
      map((quarter) => (isStockMarketClosedDate(quarter) ? getPreviousDate(quarter) : quarter)),
      switchMap((quarter) =>
        this.stocksApiService
          .getStockHistoricalPricesOnDate(this.stockSymbolSignal(), quarter)
          .pipe(catchError((e) => of(null))),
      ),
    ),
  );

  enterpriseValueToQuarterSignal = computed(() =>
    this.stockDetailsSignal().enterpriseValue.find((d) => d.date === this.quarterFormControlSignal()),
  );
  ownershipInstitutionalToQuarterSignal = computed(
    () => this.ownershipInstitutionalSignal()?.find((d) => d.date === this.quarterFormControlSignal()),
  );

  constructor() {
    super();
  }
}
