import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-cloud-functions';
import { NewsSearchComponent } from '@market-monitor/modules/market-general';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks';
import { DialogServiceModule } from '@market-monitor/shared-utils';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    DialogServiceModule,
    NewsSearchComponent,
    StockSearchBasicCustomizedComponent,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  marketApiService = inject(MarketApiService);

  marketStockNews = toSignal(this.marketApiService.getNews('stocks'));

  ngOnInit(): void {}
}
