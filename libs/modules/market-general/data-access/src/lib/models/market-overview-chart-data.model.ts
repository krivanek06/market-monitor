import { ChartDataType, MarketOverview } from '@market-monitor/api-types';
import { GenericChartSeries } from '@market-monitor/shared/data-access';

export type MarketOverviewChartDataBody = {
  marketOverview: ChartDataType;
  chartData: GenericChartSeries;
  name: string;
  subKey: string;
};
export type MarketOverviewChartData = {
  [S in keyof MarketOverview]: {
    [K in keyof MarketOverview[S]]: MarketOverviewChartDataBody;
  };
};
