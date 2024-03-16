import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SheetDataTimePeriodForm, StockTransformService } from '@mm/market-stocks/data-access';
import { StockSheetDataTableComponent, StockSheetDataTimePeriodComponent } from '@mm/market-stocks/ui';
import { GeneralCardComponent } from '@mm/shared/ui';
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
  template: `
    <div class="mb-6">
      <app-stock-sheet-data-time-period [formControl]="timePeriodControl"></app-stock-sheet-data-time-period>
    </div>

    <app-general-card additionalClasses="py-4 px-6">
      <app-stock-sheet-data-table
        *ngIf="sheetDataSignal() as balanceSheetDataSignal"
        [data]="balanceSheetDataSignal"
      ></app-stock-sheet-data-table>
    </app-general-card>
  `,
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
