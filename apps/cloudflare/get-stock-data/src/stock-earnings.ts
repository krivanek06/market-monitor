import { getStockHistoricalEarnings } from '@market-monitor/api-external';
import { EXPIRATION_ONE_WEEK, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

export const getStockEarningsWrapper = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	// create cache key
	const key = `${symbol}_earnings`;

	// check data in cache
	const cachedData = await env.get_stock_data.get(key);
	if (cachedData) {
		console.log(`Stock earnings for ${symbol} loaded from cache`);
		return new Response(cachedData, RESPONSE_HEADER);
	}

	console.log(`Stock earnings for ${symbol} loaded from API`);

	// reload data
	const stockEarnings = await getStockHistoricalEarnings(symbol);

	// save into cache
	env.get_stock_data.put(key, JSON.stringify(stockEarnings), { expirationTtl: EXPIRATION_ONE_WEEK });

	// return data
	return new Response(JSON.stringify(stockEarnings), RESPONSE_HEADER);
};
