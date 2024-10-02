import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GenericChartComponent, RangeDirective } from '@mm/shared/ui';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-ratios',
  standalone: true,
  imports: [GenericChartComponent, RangeDirective],
  template: `
    <div class="mb-4">
      <h2>Company Ratios Quarterly</h2>
    </div>

    @if (stockHistoricalMetricsSignal(); as data) {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Market Cap."
          [series]="[
            {
              type: 'line',
              name: 'Market Cap.',
              data: data.marketCap,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Enterprise Value"
          [series]="[
            {
              type: 'line',
              name: 'Enterprise Value',
              data: data.enterpriseValue,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="PE Ratio"
          [series]="[
            {
              type: 'line',
              name: 'PE Ratio',
              data: data.ratios.peRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Current Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Current Ratio',
              data: data.ratios.currentRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Quick Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Quick Ratio',
              data: data.ratios.quickRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Cash Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Cash Ratio',
              data: data.ratios.cashRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Price to Sales Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Price to Sales Ratio',
              data: data.ratios.priceToSalesRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Price to Cash Flow Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Price to Cash Flow Ratio',
              data: data.ratios.pocfratio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Price to Free Cash Flow Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Price to Free Cash Flow Ratio',
              data: data.ratios.pfcfRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Price to Book Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Price to Book Ratio',
              data: data.ratios.pbRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Debt Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Debt Ratio',
              data: data.ratios.debtRatio,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Debt to Equity Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Debt to Equity Ratio',
              data: data.ratios.debtToEquity,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Debt to Assets Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Debt to Assets Ratio',
              data: data.ratios.debtToAssets,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Dividend Yield"
          [series]="[
            {
              type: 'line',
              name: 'Dividend Yield',
              data: data.ratios.dividendYield,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Stock Compensation to Revenue Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Stock Compensation to Revenue Ratio',
              data: data.ratios.stockBasedCompensationToRevenue,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Gross Margin"
          [series]="[
            {
              type: 'line',
              name: 'Gross Margin',
              data: data.margin.grossProfitMargin,
              additionalData: {
                showPercentageSign: true,
              },
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Net Profit Margin"
          [series]="[
            {
              type: 'line',
              name: 'Net Profit Margin',
              data: data.margin.netProfitMargin,
              additionalData: {
                showPercentageSign: true,
              },
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Revenue per Share"
          [series]="[
            {
              type: 'line',
              name: 'Revenue per Share',
              data: data.perShare.revenuePerShare,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Net Income per Share"
          [series]="[
            {
              type: 'line',
              name: 'Net Income per Share',
              data: data.perShare.netIncomePerShare,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Cash per Share"
          [series]="[
            {
              type: 'line',
              name: 'Cash per Share',
              data: data.perShare.cashPerShare,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Book Value per Share"
          [series]="[
            {
              type: 'line',
              name: 'Book Value per Share',
              data: data.perShare.bookValuePerShare,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Free Cash Flow per Share"
          [series]="[
            {
              type: 'line',
              name: 'Free Cash Flow per Share',
              data: data.perShare.freeCashFlowPerShare,
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Payout Ratio"
          [series]="[
            {
              type: 'line',
              name: 'Payout Ratio',
              data: data.dividends.dividendPayoutRatio,
              additionalData: {
                showPercentageSign: true,
              },
            },
          ]"
        />

        <app-generic-chart
          [categories]="data.dates"
          [heightPx]="300"
          chartTitle="Dividend Yield"
          [series]="[
            {
              type: 'line',
              name: 'Dividend Yield',
              data: data.dividends.dividendYield,
              additionalData: {
                showPercentageSign: true,
              },
            },
          ]"
        />
      </div>
    } @else {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div *ngRange="24" class="g-skeleton h-[300px]"></div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStockDetailsRatiosComponent extends PageStockDetailsBase {
  readonly stockHistoricalMetricsSignal = toSignal(
    this.stocksApiService.getStockHistoricalMetrics(this.stockSymbolSignal()),
  );
}
