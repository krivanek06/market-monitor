import { StockSummary } from '@market-monitor/api-types';
import axios from 'axios';

export const getSymbolSummaries = async (symbols: string[]): Promise<StockSummary[]> => {
  const url = `https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${symbols.join(',')}`;
  const response = await axios.get<StockSummary[]>(url);
  return response.data;
};

export const getSymbolSummary = async (symbol: string): Promise<StockSummary | null> => {
  return getSymbolSummaries([symbol]).then((d) => d[0] ?? null);
};
