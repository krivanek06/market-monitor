export enum ChartType {
  line = 'line',
  column = 'column',
  columnStack = 'column',
  pie = 'pie',
  area = 'area',
  areaChange = 'area-change',
  areaspline = 'areaspline',
  bar = 'bar',
  spline = 'spline',
  histogram = 'histogram',
  packedbubble = 'packedbubble',
}
export interface GenericChartSeries {
  type?: ChartType;
  name?: string;
  /**
   * example: [value, value, ...] or [[timestamp, value], [timestamp, value], ...]
   */
  data: (number | null)[] | [number | null, number | null][];
  color?:
    | string
    | {
        linearGradient: { x1: number; x2: number; y1: number; y2: number };
        stops: (number | string)[][];
      };
  additionalData?: {
    id?: string;
    showCurrencySign?: boolean;
  };
}

// Used only for Pie charts
export interface GenericChartSeriesPie {
  name?: string;
  data: GenericChartSeriesData[];
  colorByPoint?: boolean;
  innerSize?: string;
  type: 'pie';
}

export interface GenericChartSeriesData {
  name?: string;
  y: number;
  color?: string;
  custom?: any;
}

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
