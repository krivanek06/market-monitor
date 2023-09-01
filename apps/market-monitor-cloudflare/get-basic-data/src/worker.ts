import { getMostPerformingStocks, getSymbolSummaries } from '@market-monitor/api-external';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
	GetBasicDataType,
	MarketTopPerformanceOverviewResponse,
	MarketTopPerformanceSymbols,
	RESPONSE_HEADER,
	StockSummary,
} from '@market-monitor/api-types';

export interface Env {
	get_basic_data: KVNamespace;
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

/**
 * One endpoint for executing and caching basic HTTP requests
 */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type') as GetBasicDataType | undefined;

		// throw error if no type
		if (!type) {
			return new Response('missing type', { status: 400 });
		}

		if (type === 'top-symbols') {
			const topSymbols = await getTopSymbols(env);
			return new Response(JSON.stringify(topSymbols), RESPONSE_HEADER);
		}

		return new Response('Unsupported request', { status: 400 });
	},
};

const getTopSymbols = async (env: Env): Promise<MarketTopPerformanceOverviewResponse> => {
	// helper function to load summaries
	const loadSummaries = async (data: MarketTopPerformanceSymbols): Promise<MarketTopPerformanceOverviewResponse> => {
		// load stock summary data
		const [gainersData, losersData, activesData] = await Promise.all([
			getSymbolSummaries(data.stockTopGainers),
			getSymbolSummaries(data.stockTopLosers),
			getSymbolSummaries(data.stockTopActive),
		]);

		// limit data
		const limit = 15;
		const filterCorrect = (d: StockSummary) => d.profile && !d.profile.isEtf && !d.profile.isFund;

		// filter out not ETFs, Funds and limit data
		const stockTopGainers = gainersData.filter(filterCorrect).slice(0, limit);
		const stockTopLosers = losersData.filter(filterCorrect).slice(0, limit);
		const stockTopActive = activesData.filter(filterCorrect).slice(0, limit);

		return {
			stockTopActive,
			stockTopGainers,
			stockTopLosers,
		};
	};
	const cacheKey = 'top_symbols';
	const cachedData = await env.get_basic_data.get(cacheKey);

	// return cached data if exists
	if (cachedData) {
		const symbolPerformance = JSON.parse(cachedData) as MarketTopPerformanceSymbols;
		const summaries = await loadSummaries(symbolPerformance);
		return summaries;
	}

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
	const summaries = await loadSummaries(result);
	return summaries;
};
