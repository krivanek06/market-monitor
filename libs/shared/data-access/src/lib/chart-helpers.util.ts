import { Directive, afterNextRender, input, signal } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { ColorScheme } from './color-scheme.model';

@Directive()
export abstract class ChartConstructor {
  heightPx = input<number>(400);

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  };

  // determine whether we use SSR or not
  // https://github.com/highcharts/highcharts-angular/issues/216
  // isHighcharts = typeof Highcharts === 'object';
  isHighcharts = signal(false);

  constructor() {
    afterNextRender(() => {
      // init chart after next render to avoid SSR error
      this.isHighcharts.set(true);
    });

    // used in constructor to avoid SSR error
    NoDataToDisplay(Highcharts);
    HC_more(Highcharts);

    Highcharts.setOptions({
      lang: {
        numericSymbols: ['k', 'M', 'B', 'T', 'P', 'E'],
      },
      colors: [
        ColorScheme.PRIMARY_VAR,
        ColorScheme.ACCENT_1_VAR,
        ColorScheme.ACCENT_2_VAR,
        ColorScheme.ACCENT_3_VAR,
        '#2caffe',
        '#544fc5',
        '#00e272',
        '#fe6a35',
        '#6b8abc',
        '#d568fb',
        '#2ee0ca',
        '#fa4b42',
        '#feb56a',
        '#91e8e1',
      ],
    });
  }
}

export type EstimatedChartDataType = {
  date: string;
  valueActual: number | null;
  valueEst: number | null;
};
