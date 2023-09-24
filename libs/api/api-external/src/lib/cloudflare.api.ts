import { MarketOverview, SymbolSummary } from '@market-monitor/api-types';
import axios from 'axios';

export const getSymbolSummaries = async (symbols: string[]): Promise<SymbolSummary[]> => {
  const url = `https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${symbols.join(',')}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.log(`Not ok ${response.statusText}, URL: ${response.url}`);
    return [];
  }
  const data = (await response.json()) as SymbolSummary[];
  return data;
};

export const getSymbolSummary = async (symbol: string): Promise<SymbolSummary | null> => {
  return getSymbolSummaries([symbol]).then((d) => d[0] ?? null);
};

export const postMarketOverview = async (overview: MarketOverview): Promise<string> => {
  const url = `https://get-basic-data.krivanek1234.workers.dev?type=market-overview-save`;
  const response = await axios.post(
    url,
    {
      ...overview,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  const data = (await response.data) as string;
  return data;
};
