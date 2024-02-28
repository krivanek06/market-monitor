import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { HistoricalPrice } from '@market-monitor/api-types';
import {
  dateFormatDate,
  formatLargeNumber,
  formatValueIntoCurrency,
} from '@market-monitor/shared/features/general-util';
import * as Highcharts from 'highcharts';

export type HistoricalPriceChartProps = {
  historicalPrice: HistoricalPrice[];
  symbolId?: string;
};

export const HistoricalPriceChart = component$<HistoricalPriceChartProps>(({ historicalPrice, symbolId }) => {
  const myChart = useSignal<HTMLElement>();

  // Hook to create the chart when the component is created
  useVisibleTask$(() => {
    if (!myChart?.value) {
      return;
    }

    const colorSuccess = '#4caf50';
    const colorDanger = '#f44336';
    const colorGray = '#4b5563';

    const price = historicalPrice.map((d) => d.close);
    const volume = historicalPrice.map((d) => d.volume);
    const dates = historicalPrice.map((d) => d.date);
    const color = !!price[0] && price[0] < price[price.length - 1] ? colorSuccess : colorDanger;

    Highcharts.chart(myChart.value, {
      chart: {
        animation: true,
        plotBackgroundColor: undefined,
        plotBorderWidth: undefined,
        plotShadow: false,
        backgroundColor: 'transparent',
        zooming: {
          mouseWheel: false,
        },
        panning: {
          enabled: true,
        },
      },
      yAxis: [
        {
          visible: false,
        },
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          opposite: false,
          gridLineWidth: 1,
          tickPixelInterval: 30,
          lineColor: '#2d2d2d',
          gridLineColor: '#2d2d2d',
          tickColor: '#2d2d2d',
          visible: true,
          labels: {
            style: {
              color: colorGray,
              font: '10px Trebuchet MS, Verdana, sans-serif',
            },
          },
        },
      ],
      xAxis: {
        visible: true,
        crosshair: true,
        type: 'category',
        categories: dates.map((date) => {
          return dateFormatDate(date, 'MMMM d, y');
        }),
        lineColor: colorGray,
        labels: {
          rotation: -12,
          style: {
            color: colorGray,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      title: {
        text: '',
      },
      scrollbar: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        borderWidth: 1,
        padding: 12,
        enabled: true,
        backgroundColor: '#1d1d1d',
        style: {
          fontSize: '16px',
          color: '#d1d5db',
        },
        shared: true,
        //useHTML: true,
        headerFormat: `<p style="color: #9ca3af; font-size: 12px">{point.key} - ${symbolId}</p><br/>`,

        pointFormatter: function () {
          const that = this as any;

          const castedName = that.series.name.toLowerCase();
          const isPrice = castedName === 'price';

          const value = isPrice ? formatValueIntoCurrency(that.y) : formatLargeNumber(that.y);

          // if value 0, don't show tooltip
          if (String(value) === 'N/A') {
            return '';
          }

          return `
              <p>
                <span style="color: ${that.series.color}; font-weight: bold" class="capitalize">● ${castedName}: </span>
                <span>${value}</span>
              </p>
              <br/>
            `;
        },
        valueDecimals: 2,
      },
      rangeSelector: {
        enabled: false,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          stacking: 'normal',
        },
        area: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, color],
              [1, 'transparent'],
            ],
          },
          lineColor: color,
          marker: {
            radius: 3,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 2,
            },
          },
          threshold: null,
        },
        series: {
          borderWidth: 0,
          enableMouseTracking: true,
        },
      },
      series: [
        {
          type: 'area',
          name: 'Price',
          data: price,
          yAxis: 1,
          color: color,
        },
        {
          type: 'column',
          name: 'Volume',
          data: volume,
          color: '#f48605',
          yAxis: 0,
          opacity: 0.45,
        },
      ],
    });
  });

  return (
    <>
      <div id="myChart" ref={myChart} style={{ width: '100%', height: '500px', display: 'block' }}></div>
    </>
  );
});
