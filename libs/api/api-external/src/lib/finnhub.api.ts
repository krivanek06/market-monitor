import { RecommendationTrends } from '@mm/api-types';
import { FINNHUB_KEY, FINNHUB_URL } from './environments';

export const getRecommendationTrends = async (symbol: string): Promise<RecommendationTrends[]> => {
  const url = `${FINNHUB_URL}/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as RecommendationTrends[];
  return data;
};
