import { ChangeDetectionStrategy, Component, effect, input, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PortfolioGrowth } from '@mm/portfolio/data-access';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import { DateRangeSliderComponent, DateRangeSliderValues, filterDataByDateRange } from '@mm/shared/ui';
import { HighchartsChartModule } from 'highcharts-angular';
import { map } from 'rxjs';

@Component({
  selector: 'app-portfolio-change-chart',
  standalone: true,
  imports: [HighchartsChartModule, DateRangeSliderComponent, ReactiveFormsModule],
  template: `
    <!-- investment growth -->
    <div class="flex items-center justify-between">
      <!-- select chart title -->
      <div class="text-wt-primary text-lg">Portfolio Change</div>

      <!-- date range -->
      @if ((data()?.length ?? 0) > 0) {
        <app-date-range-slider [style.width.px]="dateRangeWidth()" [formControl]="sliderControl" />
      }
    </div>

    @if (isHighcharts()) {
      <highcharts-chart
        [Highcharts]="Highcharts"
        [options]="chartOptionSignal()"
        [style.height.px]="heightPx()"
        style="display: block; width: 100%"
      />
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioChangeChartComponent extends ChartConstructor {
  data = input.required<PortfolioGrowth[] | null>();
  dateRangeWidth = input(550);

  sliderControl = new FormControl<DateRangeSliderValues>(
    {
      currentMaxDateIndex: 0,
      currentMinDateIndex: 0,
      dates: [],
    },
    { nonNullable: true },
  );

  chartOptionSignal = toSignal(
    this.sliderControl.valueChanges.pipe(
      map((sliderValues) => {
        const inputData = this.data() ?? [];
        const inputValues = filterDataByDateRange(inputData, sliderValues);
        const data: number[][] = [];
        for (let i = 1; i < inputValues.length; i++) {
          const current = inputValues[i].totalBalanceValue;
          const before = inputValues[i - 1].totalBalanceValue;

          data.push([Date.parse(inputValues[i].date), current - before, (current / 100) * before]);
        }

        return this.initChart(data);
      }),
    ),
    {
      initialValue: this.initChart([]),
    },
  );

  initSliderEffect = effect(() => {
    const inputValues = this.data() ?? [];
    const sliderValues: DateRangeSliderValues = {
      dates: inputValues.map((point) => point.date),
      currentMinDateIndex: 0,
      currentMaxDateIndex: inputValues.length - 1,
    };

    untracked(() => this.sliderControl.patchValue(sliderValues));
  });

  private initChart(data: number[][]): Highcharts.Options {
    return {
      chart: {
        type: 'area',
        backgroundColor: 'transparent',
        panning: {
          enabled: true,
        },
      },
      yAxis: [
        {
          title: {
            text: '',
          },
          startOnTick: false,
          endOnTick: false,
          gridLineColor: ColorScheme.GRAY_LIGHT_STRONG_VAR,
          opposite: false,
          gridLineWidth: 1,
          tickPixelInterval: 30,
          minorGridLineWidth: 0,
          visible: true,
          labels: {
            style: {
              color: ColorScheme.GRAY_MEDIUM_VAR,
              font: '10px Trebuchet MS, Verdana, sans-serif',
            },
          },
        },
      ],
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#868686',
        },
      },
      xAxis: {
        type: 'datetime',
        crosshair: true,
        dateTimeLabelFormats: {
          day: '%e of %b',
        },
        labels: {
          rotation: -20,
          enabled: true,
          style: {
            color: ColorScheme.GRAY_MEDIUM_VAR,
            font: '10px Trebuchet MS, Verdana, sans-serif',
          },
        },
      },
      title: {
        text: '',
      },
      subtitle: {
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
      plotOptions: {
        area: {
          marker: {
            enabled: true,
            radius: 3,
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 4,
            },
          },
        },
      },
      tooltip: {
        padding: 11,
        enabled: true,
        backgroundColor: ColorScheme.BACKGROUND_DASHBOARD_VAR,
        xDateFormat: '%A, %b %e, %Y',
        style: {
          fontSize: '16px',
          color: ColorScheme.GRAY_DARK_VAR,
        },
        shared: true,
        headerFormat: `<p style="color:${ColorScheme.GRAY_DARK_VAR}; font-size: 12px">{point.key}</p><br/>`,
        pointFormatter: function () {
          const that = this as any;
          const isPositive = that.y >= 0;
          const color = isPositive ? ColorScheme.SUCCESS_VAR : ColorScheme.DANGER_VAR;
          const label = isPositive ? 'Profit' : 'Loss';
          const value = formatValueIntoCurrency(this.y);
          return `<span style="font-weight: bold; color: ${color}">● ${label}: </span><span>${value} </span><br/>`;
        },
      },
      series: [
        {
          zoneAxis: 'y',
          type: 'area',
          threshold: 0,
          color: ColorScheme.SUCCESS_VAR,
          negativeColor: ColorScheme.DANGER_VAR,
          data: data,
        },
      ],
    };
  }
}
