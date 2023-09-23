import { MarketOverview, MarketOverviewData } from '@market-monitor/api-types';
import { GenericChartSeries } from './generic-chart.model';

export type MarketOverviewChartDataBody = {
  marketOverview: MarketOverviewData;
  chartData: GenericChartSeries;
  name: string;
  subKey: string;
};
export type MarketOverviewChartData = {
  [S in keyof MarketOverview]: {
    [K in keyof MarketOverview[S]]: MarketOverviewChartDataBody;
  };
};
