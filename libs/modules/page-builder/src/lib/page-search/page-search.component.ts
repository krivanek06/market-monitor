import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-client';
import { NewsSearchComponent } from '@market-monitor/modules/market-general';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks';
import { IfIsServerDirective } from '@market-monitor/shared-directives';
import { DialogServiceModule } from '@market-monitor/shared-utils-client';

@Component({
  selector: 'app-page-search',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    DialogServiceModule,
    NewsSearchComponent,
    StockSearchBasicCustomizedComponent,
    IfIsServerDirective,
  ],
  templateUrl: './page-search.component.html',
  styleUrls: ['./page-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSearchComponent implements OnInit {
  marketApiService = inject(MarketApiService);

  marketStockNews = toSignal(this.marketApiService.getNews('stocks'));

  ngOnInit(): void {}
}
