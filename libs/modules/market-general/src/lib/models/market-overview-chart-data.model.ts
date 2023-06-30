import { MarketOverview, MarketOverviewData } from '@market-monitor/api-types';
import { GenericChartSeries } from '@market-monitor/shared-components';

export type MarketOverviewChartData = {
  [S in keyof MarketOverview]: {
    [K in keyof MarketOverview[S]]: {
      marketOverview: MarketOverviewData;
      chartData: GenericChartSeries;
    };
  };
};
