import { getSymbolOwnershipInstitutional } from '@mm/api-external';
import { EXPIRATION_ONE_WEEK, RESPONSE_HEADER } from '@mm/api-types';
import { Env } from './model';

export const getStockOwnershipInstitutionalWrapper = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	// create cache key
	const key = `${symbol}_ownership_institutional`;

	// check data in cache
	const cachedData = await env.get_stock_data.get(key);
	if (cachedData) {
		console.log(`Stock ownership institutional for ${symbol} loaded from cache`);
		return new Response(cachedData, RESPONSE_HEADER);
	}

	console.log(`Stock ownership institutional for ${symbol} loaded from API`);

	try {
		// reload data
		const data = await getSymbolOwnershipInstitutional(symbol);

		// save into cache
		env.get_stock_data.put(key, JSON.stringify(data), { expirationTtl: EXPIRATION_ONE_WEEK });

		// return data
		return new Response(JSON.stringify(data), RESPONSE_HEADER);
	} catch (e) {
		console.log(e);
		return new Response(`Unable to Provide data for symbol=${symbol}`, { status: 400 });
	}
};
