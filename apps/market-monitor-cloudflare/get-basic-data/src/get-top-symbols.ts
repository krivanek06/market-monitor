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
		//	const summaries = await loadSummaries(cachedData);
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

// helper function to load summaries
// const loadSummaries = async (data: MarketTopPerformanceSymbols): Promise<MarketTopPerformanceOverviewResponse> => {
// 	// load stock summary data
// 	const [gainersData, losersData, activesData] = await Promise.all([
// 		getSymbolSummaries(data.stockTopGainers),
// 		getSymbolSummaries(data.stockTopLosers),
// 		getSymbolSummaries(data.stockTopActive),
// 	]);

// 	console.log('loaded summaries');

// 	// limit data
// 	const limit = 15;
// 	const filterCorrect = (d: StockSummary) => d.profile && !d.profile.isEtf && !d.profile.isFund;

// 	// filter out not ETFs, Funds and limit data
// 	const stockTopGainers = gainersData.filter(filterCorrect).slice(0, limit);
// 	const stockTopLosers = losersData.filter(filterCorrect).slice(0, limit);
// 	const stockTopActive = activesData.filter(filterCorrect).slice(0, limit);

// 	return {
// 		stockTopActive,
// 		stockTopGainers,
// 		stockTopLosers,
// 	};
// };
