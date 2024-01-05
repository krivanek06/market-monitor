import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SheetDataTimePeriodForm, StockTransformService } from '@market-monitor/modules/market-stocks/data-access';
import {
  StockSheetDataTableComponent,
  StockSheetDataTimePeriodComponent,
} from '@market-monitor/modules/market-stocks/ui';
import { GeneralCardComponent } from '@market-monitor/shared/ui';
import { map, startWith } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-financials',
  standalone: true,
  imports: [
    CommonModule,
    StockSheetDataTableComponent,
    GeneralCardComponent,
    StockSheetDataTimePeriodComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './page-stock-details-financials.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsFinancialsComponent extends PageStockDetailsBase {
  stockTransformService = inject(StockTransformService);

  timePeriodControl = new FormControl<SheetDataTimePeriodForm>(
    {
      timePeriod: 'financialsAnnual',
      sheetKey: 'balance',
    },
    { nonNullable: true },
  );

  sheetDataSignal = toSignal(
    this.timePeriodControl.valueChanges.pipe(
      startWith(this.timePeriodControl.value),
      map((timePeriod) => {
        const time = timePeriod.timePeriod;
        const key = timePeriod.sheetKey;
        if (key === 'cash') {
          return this.stockTransformService.createSheetDataFromCashFlow(time, this.stockDetailsSignal());
        }
        if (key === 'income') {
          return this.stockTransformService.createSheetDataFromIncomeStatement(time, this.stockDetailsSignal());
        }
        return this.stockTransformService.createSheetDataFromBalanceSheet(time, this.stockDetailsSignal());
      }),
    ),
  );

  constructor() {
    super();
  }
}
