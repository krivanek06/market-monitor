import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-client';
import { INDEXES_DEFAULT, INDEXES_DEFAULT_SYMBOLS, SYMBOL_SP500, SymbolQuote } from '@market-monitor/api-types';
import {
  AssetPriceChartInteractiveComponent,
  MarketDataTransformService,
  QuoteSearchBasicComponent,
} from '@market-monitor/modules/market-general';
import { GenericChartComponent, ValuePresentationCardComponent } from '@market-monitor/shared-components';
import { PercentageIncreaseDirective } from '@market-monitor/shared-directives';
import { map } from 'rxjs';
import { MarketOverviewSkeletonComponent } from './market-overview-skeleton.component';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [
    CommonModule,
    AssetPriceChartInteractiveComponent,
    GenericChartComponent,
    QuoteSearchBasicComponent,
    ReactiveFormsModule,
    MatButtonModule,
    ValuePresentationCardComponent,
    PercentageIncreaseDirective,
    MarketOverviewSkeletonComponent,
  ],
  templateUrl: './market-overview.component.html',
  styleUrls: ['./market-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketOverviewComponent {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);
  selectedIndexSymbolQuoteControl = new FormControl<SymbolQuote | null>(null);

  SYMBOL_SP500 = SYMBOL_SP500;

  marketOverviewSignal = toSignal(
    this.marketApiService
      .getMarketOverview()
      .pipe(map((marketOverview) => this.marketDataTransformService.transformMarketOverview(marketOverview)))
  );

  marketTopIndexQuotesSignal = toSignal(
    this.marketApiService.getQuotesBySymbols(INDEXES_DEFAULT_SYMBOLS).pipe(
      map((quotes) =>
        quotes.map((quote, index) => ({
          name: INDEXES_DEFAULT[index].name,
          quote,
        }))
      )
    )
  );
}
