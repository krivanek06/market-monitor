import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { SYMBOL_SP500 } from '@market-monitor/api-types';
import { AssetPriceChartInteractiveComponent } from '@market-monitor/modules/market-general';
import { DialogServiceModule } from '@market-monitor/shared-utils';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, AssetPriceChartInteractiveComponent, DialogServiceModule],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketComponent {
  marketApiService = inject(MarketApiService);
  SYMBOL_SP500 = SYMBOL_SP500;
}
