import { getInstitutionalPortfolioDates, getMostPerformingStocks, getQuotesByType, getSymbolSummaries } from '@market-monitor/api-external';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
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
	AvailableQuotes,
	GetBasicDataType,
	MarketTopPerformanceOverviewResponse,
	MarketTopPerformanceSymbols,
	RESPONSE_HEADER,
	StockSummary,
	SymbolQuote,
} from '@market-monitor/api-types';
import { sql } from 'drizzle-orm';

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

const MarketDataTable = sqliteTable('MarketDataTable', {
	id: text('id').primaryKey(),
	data: text('data').notNull().$type<string>(),
	lastUpdate: text('lastUpdate')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

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

		/**
		 * TODO: not working, upgrade to enterprise plan
		 */
		if (type === 'institutional-portfolio-dates') {
			const institutionalPortfolioDates = await getInstitutionalPortfolioDatesWrapper(env);
			return new Response(JSON.stringify(institutionalPortfolioDates), RESPONSE_HEADER);
		}

		if (type === 'quote-by-type') {
			const quoteType = searchParams.get('quoteType') as AvailableQuotes | undefined;
			if (!quoteType) {
				return new Response('missing quote type', { status: 400 });
			}
			const quotes = await getQuotesByTypeWrapper(env, quoteType);
			return new Response(JSON.stringify(quotes), RESPONSE_HEADER);
		}

		return new Response('Unsupported request', { status: 400 });
	},
};

const getInstitutionalPortfolioDatesWrapper = async (env: Env): Promise<string[]> => {
	// load data from KV
	const key = 'institutional_portfolio_dates';
	const cachedData = await env.get_basic_data.get(key);
	if (cachedData) {
		return JSON.parse(cachedData) as string[];
	}

	// load from api
	const data = await getInstitutionalPortfolioDates();

	// save into cache
	const expirationOneWeek = 60 * 60 * 24 * 7;
	env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: expirationOneWeek });
	return data;
};

const getQuotesByTypeWrapper = async (env: Env, quoteType: AvailableQuotes): Promise<SymbolQuote[]> => {
	// load data from KV
	const key = `quote_${quoteType}`;
	const cachedData = await env.get_basic_data.get(key);
	if (cachedData) {
		return JSON.parse(cachedData) as SymbolQuote[];
	}

	// load data
	const data = await getQuotesByType(quoteType);

	// save into cache for 1 week
	const expirationOneWeek = 60 * 60 * 24 * 7;
	env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: expirationOneWeek });
	return data;
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
