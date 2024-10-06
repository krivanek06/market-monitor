import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SheetDataTimePeriodForm, StockTransformService } from '@mm/market-stocks/data-access';
import { StockSheetDataTableComponent, StockSheetDataTimePeriodComponent } from '@mm/market-stocks/ui';
import { GeneralCardComponent } from '@mm/shared/ui';
import { map, startWith, switchMap } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-financials',
  standalone: true,
  imports: [StockSheetDataTableComponent, GeneralCardComponent, StockSheetDataTimePeriodComponent, ReactiveFormsModule],
  template: `
    <div class="mb-6">
      <app-stock-sheet-data-time-period [formControl]="timePeriodControl" />
    </div>

    <app-general-card additionalClasses="py-4 px-6 w-max xl:w-full" class="overflow-x-scroll">
      @if (sheetDataSignal(); as balanceSheetDataSignal) {
        <app-stock-sheet-data-table [data]="balanceSheetDataSignal" />
      }
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
  private readonly stockTransformService = inject(StockTransformService);

  readonly timePeriodControl = new FormControl<SheetDataTimePeriodForm>(
    {
      timePeriod: 'financialsAnnual',
      sheetKey: 'balance',
    },
    { nonNullable: true },
  );

  /** which financial sheet to display */
  readonly sheetDataSignal = toSignal(
    toObservable(this.stockDetailsSignal).pipe(
      switchMap((stockDetails) =>
        this.timePeriodControl.valueChanges.pipe(
          startWith(this.timePeriodControl.value),
          map((timePeriod) => {
            const time = timePeriod.timePeriod;
            const key = timePeriod.sheetKey;
            // cash flow
            if (key === 'cash') {
              return this.stockTransformService.createSheetDataFromCashFlow(time, stockDetails);
            }
            // income statement
            if (key === 'income') {
              return this.stockTransformService.createSheetDataFromIncomeStatement(time, stockDetails);
            }
            // balance sheet
            return this.stockTransformService.createSheetDataFromBalanceSheet(time, stockDetails);
          }),
        ),
      ),
    ),
  );
}
