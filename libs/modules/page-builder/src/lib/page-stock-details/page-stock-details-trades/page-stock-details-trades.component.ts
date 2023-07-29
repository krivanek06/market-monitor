import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { StocksApiService } from '@market-monitor/api-client';
import { StockDetails } from '@market-monitor/api-types';
import { StockOwnershipInstitutionalCardComponent } from '@market-monitor/modules/market-stocks';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-stock-details-trades',
  standalone: true,
  imports: [CommonModule, StockOwnershipInstitutionalCardComponent],
  templateUrl: './page-stock-details-trades.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsTradesComponent {
  route = inject(ActivatedRoute);
  stocksApiService = inject(StocksApiService);

  currentQuarter = '2023-03-31';

  private stockDetails$ = (this.route.parent as ActivatedRoute).data.pipe(
    map((data) => data['stockDetails'] as StockDetails)
  );

  stockDetailsSignal = toSignal(this.stockDetails$);
  ownershipInstitutionalSignal = toSignal(
    this.stockDetails$.pipe(switchMap((details) => this.stocksApiService.getStockOwnershipInstitutional(details.id)))
  );

  enterpriseValueToQuarterSignal = computed(() =>
    this.stockDetailsSignal()?.enterpriseValue.find((d) => d.date === this.currentQuarter)
  );
  ownershipInstitutionalToQuarterSignal = computed(() =>
    this.ownershipInstitutionalSignal()?.find((d) => d.date >= this.currentQuarter)
  );
}
