import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { SYMBOL_DOW_JONES, SYMBOL_NASDAQ, SYMBOL_SP500 } from '@market-monitor/api-types';
import {
  AssetPriceChartInteractiveComponent,
  MarketDataTransformService,
} from '@market-monitor/modules/market-general';
import { GenericChartComponent } from '@market-monitor/shared-components';
import { map } from 'rxjs';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [CommonModule, AssetPriceChartInteractiveComponent, GenericChartComponent],
  templateUrl: './market-overview.component.html',
  styleUrls: ['./market-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketOverviewComponent {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);
  SYMBOL_SP500 = SYMBOL_SP500;
  SYMBOL_DOW_JONES = SYMBOL_DOW_JONES;
  SYMBOL_NASDAQ = SYMBOL_NASDAQ;

  marketOverviewSignal = toSignal(
    this.marketApiService
      .getMarketOverview()
      .pipe(map((marketOverview) => this.marketDataTransformService.transformMarketOverview(marketOverview)))
  );
}
