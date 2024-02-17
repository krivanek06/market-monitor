import * as Highcharts from 'highcharts';

export type GenericChartSeries<T extends Highcharts.SeriesOptionsType['type']> = Highcharts.SeriesOptionsType & {
  type: T;
  additionalData?: {
    id?: string;
    showCurrencySign?: boolean;
    showPercentageSign?: boolean;
    colorTooltipDefault?: boolean;
  } & Record<string, unknown>;
};

export const ChartGenericColors = [
  '#7712aa',
  '#126baa',
  '#12beaa',
  '#12aa6b',
  '#38aa12',
  '#122baa',
  '#3812aa',
  '#77aa12',
  '#17d4d4',
  '#095555',
  '#aa6d12',
] as const;

export const getChartGenericColor = (index: number) => {
  return ChartGenericColors[index % ChartGenericColors.length];
};
