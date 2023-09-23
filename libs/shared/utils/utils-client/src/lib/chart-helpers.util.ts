import { inject } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { PlatformService } from './platform';

export abstract class ChartConstructor {
  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  updateFromInput = true;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  };

  chartOptions: Highcharts.Options = {};

  platform = inject(PlatformService);

  // determine whether we use SSR or not
  // https://github.com/highcharts/highcharts-angular/issues/216
  // isHighcharts = typeof Highcharts === 'object';
  isHighcharts = this.platform.isBrowser;

  constructor() {
    if (this.platform.isServer) {
      return;
    }

    // used in constructor to avoid SSR error
    NoDataToDisplay(Highcharts);
    HC_more(Highcharts);

    Highcharts.setOptions({
      lang: {
        numericSymbols: ['k', 'M', 'B', 'T', 'P', 'E'],
      },
    });
  }
}

export type EstimatedChartDataType = {
  date: string;
  valueActual: number | null;
  valueEst: number | null;
};
