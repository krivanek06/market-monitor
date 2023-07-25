import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { StockDetails } from '@market-monitor/api-types';
import { StockSheetDataTableComponent, StockTransformService } from '@market-monitor/modules/market-stocks';
import { GeneralCardComponent } from '@market-monitor/shared-components';
import { map } from 'rxjs';

@Component({
  selector: 'app-stock-details-financials',
  standalone: true,
  imports: [CommonModule, StockSheetDataTableComponent, GeneralCardComponent],
  templateUrl: './stock-details-financials.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockDetailsFinancialsComponent {
  route = inject(ActivatedRoute);
  stockTransformService = inject(StockTransformService);
  private stockDetails$ = (this.route.parent as ActivatedRoute).data.pipe(
    map((data) => data['stockDetails'] as StockDetails)
  );
  balanceSheetDataSignal = toSignal(
    this.stockDetails$.pipe(
      map((data) => this.stockTransformService.createSheetDataFromBalanceSheet('financialsAnnual', data))
    )
  );
}
