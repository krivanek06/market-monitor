import { InputSource } from '@market-monitor/shared/data-access';

export type DashboardChartTypes = 'PortfolioGrowth' | 'PortfolioChange' | 'PortfolioAssets';
export const dashboardChartOptionsInputSource: InputSource<{
  caption: string;
  value: DashboardChartTypes;
}>[] = [
  {
    caption: 'Portfolio Growth',
    value: {
      caption: 'Portfolio Growth',
      value: 'PortfolioGrowth',
    },
  },
  {
    caption: 'Portfolio Change',
    value: {
      caption: 'Portfolio Change',
      value: 'PortfolioChange',
    },
  },
  {
    caption: 'Portfolio Assets',
    value: {
      caption: 'Portfolio Assets',
      value: 'PortfolioAssets',
    },
  },
];
