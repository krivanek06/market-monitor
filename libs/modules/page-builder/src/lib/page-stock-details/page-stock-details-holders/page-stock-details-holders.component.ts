import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MarketApiService } from '@market-monitor/api-client';
import { MarketDataTransformService } from '@market-monitor/modules/market-general';
import {
  StockOwnershipHoldersTableComponent,
  StockOwnershipInstitutionalCardComponent,
} from '@market-monitor/modules/market-stocks';
import { FormMatInputWrapperComponent, GeneralCardComponent } from '@market-monitor/shared-components';
import { filter, map, switchMap, tap } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-holders',
  standalone: true,
  imports: [
    CommonModule,
    StockOwnershipInstitutionalCardComponent,
    StockOwnershipHoldersTableComponent,
    GeneralCardComponent,
    FormMatInputWrapperComponent,
    ReactiveFormsModule,
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
  quarterFormControlSignal = toSignal(this.quarterFormControl.valueChanges);
  ownershipInstitutionalSignal = toSignal(
    this.stocksApiService.getStockOwnershipInstitutional(this.stockSymbolSignal())
  );
  ownershipHoldersToDateSignal = toSignal(
    this.quarterFormControl.valueChanges.pipe(
      filter((data): data is string => !!data),
      switchMap((quarter) => this.stocksApiService.getStockOwnershipHoldersToDate(this.stockSymbolSignal(), quarter))
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

  constructor() {
    super();
  }
}
