import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MarketApiService, StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { MarketDataTransformService } from '@market-monitor/modules/market-general';
import {
  StockOwnershipHoldersTableComponent,
  StockOwnershipInstitutionalCardComponent,
} from '@market-monitor/modules/market-stocks';
import { FormMatInputWrapperComponent, GeneralCardComponent } from '@market-monitor/shared-components';
import { combineLatest, filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-page-stock-details-trades',
  standalone: true,
  imports: [
    CommonModule,
    StockOwnershipInstitutionalCardComponent,
    StockOwnershipHoldersTableComponent,
    GeneralCardComponent,
    FormMatInputWrapperComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './page-stock-details-trades.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsTradesComponent {
  route = inject(ActivatedRoute);
  stocksApiService = inject(StocksApiService);
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);

  quarterFormControl = new FormControl<string | null>(null);
  quarterFormControlSignal = toSignal(this.quarterFormControl.valueChanges);

  private stockDetails$ = (this.route.parent as ActivatedRoute).data.pipe(
    map((data) => data['stockDetails'] as StockDetails)
  );

  stockDetailsSignal = toSignal(this.stockDetails$);
  ownershipInstitutionalSignal = toSignal(
    this.stockDetails$.pipe(switchMap((details) => this.stocksApiService.getStockOwnershipInstitutional(details.id)))
  );
  ownershipHoldersToDateSignal = toSignal(
    combineLatest([this.stockDetails$, this.quarterFormControl.valueChanges]).pipe(
      filter((data): data is [StockDetails, string] => !!data[1]),
      switchMap(([details, quarter]) => this.stocksApiService.getStockOwnershipHoldersToDate(details.id, quarter))
    )
  );
  institutionalPortfolioInputSourceSignal = toSignal(
    this.marketApiService.getInstitutionalPortfolioDates().pipe(
      map((d) => this.marketDataTransformService.transformDatesIntoInputSource(d)),
      tap((data) => this.quarterFormControl.setValue(data[0].value))
    )
  );

  enterpriseValueToQuarterSignal = computed(() =>
    this.stockDetailsSignal()?.enterpriseValue.find((d) => d.date === this.quarterFormControlSignal())
  );
  ownershipInstitutionalToQuarterSignal = computed(() =>
    this.ownershipInstitutionalSignal()?.find((d) => d.date === this.quarterFormControlSignal())
  );
}
