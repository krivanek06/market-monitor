import { getInsiderTrading } from '@mm/api-external';
import { EXPIRATION_ONE_WEEK, RESPONSE_HEADER } from '@mm/api-types';
import { Env } from './model';

export const getStockInsiderTradesWrapper = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	// create cache key
	const key = `${symbol}_insider_trades`;

	// check data in cache
	const cachedData = await env.get_stock_data.get(key);
	if (cachedData) {
		console.log(`Stock insider trades for ${symbol} loaded from cache`);
		return new Response(cachedData, RESPONSE_HEADER);
	}

	console.log(`Stock insider trades for ${symbol} loaded from API`);

	// reload data
	const [page0, page1, page2] = await Promise.all([
		getInsiderTrading(symbol, 0),
		getInsiderTrading(symbol, 1),
		getInsiderTrading(symbol, 2),
	]);

	const data = [...page0, ...page1, ...page2];

	// save data to cache
	env.get_stock_data.put(key, JSON.stringify(data), { expirationTtl: EXPIRATION_ONE_WEEK });

	// return data
	try {
		return new Response(JSON.stringify(data), RESPONSE_HEADER);
	} catch (e) {
		console.log(e);
		return new Response(`Unable to Provide data for symbol=${symbol}`, { status: 400 });
	}
};
