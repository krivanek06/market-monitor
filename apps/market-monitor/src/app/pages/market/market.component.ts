import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { SYMBOL_SP500 } from '@market-monitor/api-types';
import {
  AssetPriceChartInteractiveComponent,
  MarketDataTransformService,
} from '@market-monitor/modules/market-general';
import { DialogServiceModule } from '@market-monitor/shared-utils';
import { map } from 'rxjs';
import { GenericChartComponent } from './../../../../../../libs/shared/components/src/lib/charts/generic-chart/generic-chart.component';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, AssetPriceChartInteractiveComponent, DialogServiceModule, GenericChartComponent],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketComponent {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);
  SYMBOL_SP500 = SYMBOL_SP500;

  marketOverviewSignal = toSignal(
    this.marketApiService
      .getMarketOverview()
      .pipe(map((marketOverview) => this.marketDataTransformService.getMarketOverviewChartData(marketOverview)))
  );
}
