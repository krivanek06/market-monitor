import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-trading-simulator-symbol-price-chart',
  standalone: true,
  imports: [HighchartsChartModule],
  template: `<p>trading-simulator-symbol-price-chart works!</p>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorSymbolPriceChartComponent {}
