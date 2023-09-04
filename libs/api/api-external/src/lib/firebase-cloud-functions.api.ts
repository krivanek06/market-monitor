import { MarketOverviewData, MarketOverviewDatabaseKeys } from '@market-monitor/api-types';

export const getMarketOverviewDataAPI = async (
  key: MarketOverviewDatabaseKeys,
  subKey: string,
): Promise<MarketOverviewData> => {
  const url = `https://getmarketoverviewdata-jhgz46ksfq-ey.a.run.app/?key=${key}&subKey=${subKey}`;
  const response = await fetch(url);
  const data = (await response.json()) as MarketOverviewData;
  return data;
};
