import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MARKET_OVERVIEW_DATA } from '@market-monitor/modules/market-general';

@Component({
  selector: 'app-market-custom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-custom.component.html',
  styleUrls: ['./market-custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketCustomComponent {
  MARKET_OVERVIEW_DATA = MARKET_OVERVIEW_DATA;
}
