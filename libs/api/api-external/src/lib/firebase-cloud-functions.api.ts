import { ChartDataType, MarketOverviewKey, MarketOverviewSubkeyReadable } from '@market-monitor/api-types';

export const getMarketOverviewDataAPI = async (
  key: MarketOverviewKey,
  subKey: MarketOverviewSubkeyReadable<MarketOverviewKey>,
): Promise<ChartDataType> => {
  const url = `https://getmarketoverviewdata-jhgz46ksfq-ey.a.run.app/?key=${key}&subKey=${subKey}`;
  const response = await fetch(url);
  const data = (await response.json()) as ChartDataType;
  return data;
};
