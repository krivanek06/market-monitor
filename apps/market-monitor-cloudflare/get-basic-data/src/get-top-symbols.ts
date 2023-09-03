import { getMostPerformingStocks } from '@market-monitor/api-external';
import { MarketTopPerformanceSymbols, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

export const getTopSymbols = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	const cacheKey = 'top_symbols';
	const cachedData = (await env.get_basic_data.get(cacheKey, {
		type: 'json',
	})) as MarketTopPerformanceSymbols;

	// return cached data if exists
	if (cachedData) {
		console.log('Top symbols loaded from cache');
		return new Response(JSON.stringify(cachedData), RESPONSE_HEADER);
	}

	console.log('Top symbols loaded from API');

	// get data from API
	const [gainers, losers, actives] = await Promise.all([
		getMostPerformingStocks('gainers'),
		getMostPerformingStocks('losers'),
		getMostPerformingStocks('actives'),
	]);

	// construct object based on symbols
	const result: MarketTopPerformanceSymbols = {
		stockTopActive: actives.map((d) => d.symbol),
		stockTopGainers: gainers.map((d) => d.symbol),
		stockTopLosers: losers.map((d) => d.symbol),
	};

	// save into cache for 15 minutes
	const minutes10 = 60 * 15;
	await env.get_basic_data.put(cacheKey, JSON.stringify(result), { expirationTtl: minutes10 });

	// load summaries
	// const summaries = await loadSummaries(result);

	// return data
	return new Response(JSON.stringify(result), RESPONSE_HEADER);
};
