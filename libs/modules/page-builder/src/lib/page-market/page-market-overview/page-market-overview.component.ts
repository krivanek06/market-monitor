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
import { GeneralCardComponent, GenericChartComponent } from '@market-monitor/shared-components';
import { PercentageIncreaseDirective, RenderClientDirective } from '@market-monitor/shared-directives';
import { map } from 'rxjs';
import { PageMarketOverviewSkeletonComponent } from './page-market-overview-skeleton.component';

@Component({
  selector: 'app-page-market-overview',
  standalone: true,
  imports: [
    CommonModule,
    AssetPriceChartInteractiveComponent,
    GenericChartComponent,
    QuoteSearchBasicComponent,
    ReactiveFormsModule,
    MatButtonModule,
    GeneralCardComponent,
    PercentageIncreaseDirective,
    PageMarketOverviewSkeletonComponent,
    RenderClientDirective,
  ],
  templateUrl: './page-market-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PageMarketOverviewComponent {
  marketApiService = inject(MarketApiService);
  marketDataTransformService = inject(MarketDataTransformService);

  selectedIndexSymbolQuoteControl = new FormControl<SymbolQuote | null>(null);

  SYMBOL_SP500 = SYMBOL_SP500;

  marketOverviewSignal = toSignal(
    this.marketApiService
      .getMarketOverview()
      .pipe(map((marketOverview) => this.marketDataTransformService.transformMarketOverview(marketOverview))),
  );

  marketTopIndexQuotesSignal = toSignal(
    this.marketApiService.getQuotesBySymbols(INDEXES_DEFAULT_SYMBOLS).pipe(
      map((quotes) =>
        quotes.map((quote, index) => ({
          name: INDEXES_DEFAULT[index].name,
          quote,
        })),
      ),
    ),
  );
}
