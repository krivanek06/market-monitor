import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MarketApiService } from '@market-monitor/api-client';
import { INDEXES_DEFAULT, INDEXES_DEFAULT_SYMBOLS, SYMBOL_SP500, SymbolQuote } from '@market-monitor/api-types';
import {
  AssetPriceChartInteractiveComponent,
  QuoteSearchBasicComponent,
} from '@market-monitor/modules/market-general/features';
import {
  FlattenArrayPipe,
  GeneralCardComponent,
  GenericChartComponent,
  MultiplyDtaPipe,
  PercentageIncreaseDirective,
  RangeDirective,
  RenderClientDirective,
  SortReversePipe,
} from '@market-monitor/shared/ui';
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
    RangeDirective,
    FlattenArrayPipe,
    SortReversePipe,
    MultiplyDtaPipe,
  ],
  templateUrl: './page-market-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
      :host {
        display: block;
      }
  `,
})
export class PageMarketOverviewComponent {
  marketApiService = inject(MarketApiService);

  selectedIndexSymbolQuoteControl = new FormControl<SymbolQuote | null>(null);

  SYMBOL_SP500 = SYMBOL_SP500;

  marketOverviewSignal = toSignal(this.marketApiService.getMarketOverview());

  marketTopIndexQuotesSignal = toSignal(
    this.marketApiService.getSymbolSummaries(INDEXES_DEFAULT_SYMBOLS).pipe(
      map((quotes) =>
        quotes.map((summary, index) => ({
          name: INDEXES_DEFAULT[index].name,
          summary,
        })),
      ),
    ),
  );
}
