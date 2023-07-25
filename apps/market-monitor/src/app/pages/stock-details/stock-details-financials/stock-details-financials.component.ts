import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StockDetails } from '@market-monitor/api-types';
import {
  SheetDataTimePeriodForm,
  StockSheetDataTableComponent,
  StockSheetDataTimePeriodComponent,
  StockTransformService,
} from '@market-monitor/modules/market-stocks';
import { GeneralCardComponent } from '@market-monitor/shared-components';
import { map } from 'rxjs';

@Component({
  selector: 'app-stock-details-financials',
  standalone: true,
  imports: [
    CommonModule,
    StockSheetDataTableComponent,
    GeneralCardComponent,
    StockSheetDataTimePeriodComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './stock-details-financials.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsFinancialsComponent {
  route = inject(ActivatedRoute);
  stockTransformService = inject(StockTransformService);

  timePeriodControl = new FormControl<SheetDataTimePeriodForm>(
    {
      timePeriod: 'financialsAnnual',
      sheetKey: 'balance',
    },
    { nonNullable: true }
  );

  private stockDetails$ = (this.route.parent as ActivatedRoute).data.pipe(
    map((data) => data['stockDetails'] as StockDetails)
  );
  balanceSheetDataSignal = toSignal(
    this.stockDetails$.pipe(
      map((data) => this.stockTransformService.createSheetDataFromBalanceSheet('financialsAnnual', data))
    )
  );

  constructor() {
    this.timePeriodControl.valueChanges.subscribe(console.log);
  }
}
