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

export type ChartTypeKeys = keyof typeof ChartType;

export type GenericChartSeriesAcceptedData =
  | (number | null)
  | [number | null, number | null]
  | { name: string; y: number; color?: string };

export interface GenericChartSeries<TData extends GenericChartSeriesAcceptedData = GenericChartSeriesAcceptedData> {
  type?: ChartType;
  name?: string;
  showInNavigator?: boolean;
  colorByPoint?: boolean;
  /**
   * example: [value, value, ...] or [[timestamp, value], [timestamp, value], ...]
   */
  data: TData[];
  color?:
    | string
    | {
        linearGradient: { x1: number; x2: number; y1: number; y2: number };
        stops: (number | string)[][];
      };
  additionalData?: {
    id?: string;
    showCurrencySign?: boolean;
    showPercentageSign?: boolean;
    colorTooltipDefault?: boolean;
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
