import { RecommendationTrends } from '@market-monitor/shared-types';
import axios from 'axios';
import { FINNHUB_KEY, FINNHUB_URL } from '../environments';

export const getRecommendationTrends = async (
  symbol: string
): Promise<RecommendationTrends[]> => {
  const url = `${FINNHUB_URL}/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_KEY}`;
  const response = await axios.get<RecommendationTrends[]>(url);
  return response.data;
};
