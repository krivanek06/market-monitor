import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PortfolioGrowth } from '@mm/portfolio/data-access';
import { ChartConstructor, ColorScheme } from '@mm/shared/data-access';
import { formatValueIntoCurrency } from '@mm/shared/general-util';
import {
  DateRangeSliderComponent,
  DateRangeSliderValues,
  SectionTitleComponent,
  filterDataByDateRange,
} from '@mm/shared/ui';
import { HighchartsChartModule } from 'highcharts-angular';
import { filterNil } from 'ngxtension/filter-nil';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-portfolio-change-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, DateRangeSliderComponent, ReactiveFormsModule, SectionTitleComponent],
  template: `
    <!-- investment growth -->
    <div class="flex items-center justify-between">
      <!-- select chart title -->
      <app-section-title title="Portfolio Change Chart" />

      <!-- date range -->
      <app-date-range-slider class="w-[550px]" [formControl]="sliderControl"></app-date-range-slider>
    </div>

    <highcharts-chart
      *ngIf="isHighcharts"
      [(update)]="updateFromInput"
      [Highcharts]="Highcharts"
      [callbackFunction]="chartCallback"
      [options]="chartOptions"
      [style.height.px]="heightPx()"
      style="display: block; width: 100%"
    >
    </highcharts-chart>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioChangeChartComponent extends ChartConstructor {
  sliderControl = new FormControl<DateRangeSliderValues | null>(null, { nonNullable: true });

  @Input({ required: true }) set data(input: PortfolioGrowth[]) {
    const sliderValues: DateRangeSliderValues = {
      dates: input.map((point) => point.date),
      currentMinDateIndex: 0,
      currentMaxDateIndex: input.length - 1,
    };

    this.sliderControl.patchValue(sliderValues);
    this.initSlider(input);
  }

  private initSlider(input: PortfolioGrowth[]): void {
    this.sliderControl.valueChanges.pipe(startWith(this.sliderControl.value), filterNil()).subscribe((sliderValues) => {
      const inputValues = filterDataByDateRange(input, sliderValues);
      const data: number[][] = [];
      for (let i = 1; i < inputValues.length; i++) {
        const current = inputValues[i].totalBalanceValue;
        const before = inputValues[i - 1].totalBalanceValue;

        data.push([Date.parse(inputValues[i].date), current - before, (current / 100) * before]);
      }

      this.initChart(data);
    });
  }

  private initChart(data: number[][]) {
    this.chartOptions = {
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
          gridLineColor: '#66666655',
          opposite: false,
          gridLineWidth: 1,
          minorTickInterval: 'auto',
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
        backgroundColor: ColorScheme.GRAY_DARK_STRONG_VAR,
        xDateFormat: '%A, %b %e, %Y',
        style: {
          fontSize: '16px',
          color: ColorScheme.GRAY_LIGHT_STRONG_VAR,
        },
        shared: true,
        headerFormat: `<p style="color:${ColorScheme.GRAY_LIGHT_STRONG_VAR}; font-size: 12px">{point.key}</p><br/>`,
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
