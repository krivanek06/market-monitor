import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MarketApiService } from '@mm/api-client';
import { SymbolSummary } from '@mm/api-types';
import { AssetPriceChartInteractiveComponent } from '@mm/market-general/features';
import { SymbolSummaryListComponent } from '@mm/market-stocks/ui';
import { QuoteItemComponent, RangeDirective } from '@mm/shared/ui';
import { tap } from 'rxjs';
import { MarketingBasicCardComponent } from '../components';

@Component({
  selector: 'app-marketing-page-welcome-market-monitor',
  imports: [
    QuoteItemComponent,
    RangeDirective,
    NgClass,
    AssetPriceChartInteractiveComponent,
    SymbolSummaryListComponent,
    MarketingBasicCardComponent,
  ],
  template: `
    <section class="grid place-content-center">
      <div class="g-section-title">Market Monitoring</div>

      <div class="mx-auto mb-6 grid gap-x-10 gap-y-4 text-center text-gray-300 md:mb-16 md:grid-cols-2 lg:w-[80%]">
        <p id="mm-p1" class="p-4 text-xl">
          Whether you're tracking blue-chip stocks or uncovering hidden gems in small-cap companies, we bring the entire
          marketplace to your screen
        </p>
        <p id="mm-p2" class="p-4 text-xl">
          Explore stocks across various sectors, geographies, market caps, and get detailed financial information on
          companies you are interested in
        </p>
      </div>

      <!-- display symbols -->
      <div class="mb-6 hidden grid-cols-2 gap-x-8 gap-y-4 md:mb-14 md:grid lg:grid-cols-3 2xl:grid-cols-4">
        @if (symbolSummaries.isLoading()) {
          <div *ngRange="symbols.length" class="g-skeleton h-12"></div>
        } @else {
          @for (summary of symbolSummaries.value(); track summary.id) {
            <div
              (click)="selectedSummary.set(summary)"
              class="cursor-pointer rounded-lg border-solid px-4 py-2 text-lg transition-all duration-300 hover:scale-105 hover:bg-gray-900 hover:outline-dashed hover:outline-2 hover:outline-cyan-800"
              [ngClass]="{
                'bg-gray-900 outline-dashed outline-2 outline-cyan-800': selectedSummary()?.id === summary.id,
              }"
            >
              <app-quote-item [symbolQuote]="summary.quote" />
            </div>
          }
        }
      </div>

      <!-- selected symbol data -->
      <div class="grid gap-4 xl:grid-cols-3">
        <!-- historical chart -->
        <div class="xl:col-span-2">
          @if (selectedSummary(); as selectedSummary) {
            @defer (on viewport) {
              <app-asset-price-chart-interactive [symbol]="selectedSummary.id" [chartHeightPx]="420" />
            } @placeholder {
              <div class="g-skeleton h-[420px]"></div>
            } @loading (minimum 1s) {
              <div class="g-skeleton h-[420px]"></div>
            }
          } @else {
            <div class="g-skeleton h-[420px]"></div>
          }
        </div>
        <!-- summary -->
        <div>
          @if (selectedSummary(); as selectedSummary) {
            <app-marketing-basic-card>
              <app-symbol-summary-list [symbolSummary]="selectedSummary" />
            </app-marketing-basic-card>
          } @else {
            <div class="g-skeleton h-[470px]"></div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingPageWelcomeMarketMonitorComponent {
  private readonly marketApiService = inject(MarketApiService);
  readonly symbols = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'META', 'NVDA', 'PYPL'];

  readonly selectedSummary = signal<SymbolSummary | null>(null);
  readonly symbolSummaries = rxResource({
    loader: () =>
      this.marketApiService
        .getSymbolSummaries(this.symbols)
        .pipe(tap((data) => this.selectedSummary.set(data[0] || null))),
  });
}
