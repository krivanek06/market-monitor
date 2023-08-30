import { format, subDays } from 'date-fns';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	get_historical_prices: KVNamespace;
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

type HistoricalLoadingPeriods = '1min' | '5min' | '1hour' | '4hour' | '1day' | '1week' | '1month';

export interface HistoricalPrice {
	date: string;
	open: number;
	low: number;
	high: number;
	close: number;
	volume: number;
}

type HistoricalPricePeriods = '1d' | '1w' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'ytd' | 'all';

const FINANCIAL_MODELING_KEY = '645c1db245d983df8a2d31bc39b92c32';
const FINANCIAL_MODELING_URL = 'https://financialmodelingprep.com/api';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);

		const symbol = searchParams.get('symbol') as string | undefined;
		const period = searchParams.get('period') as HistoricalPricePeriods | undefined;
		const date = searchParams.get('date') as string | undefined;
		const isCrypto = searchParams.get('isCrypto') as string | undefined;

		const isCryptoBool = isCrypto === 'true';

		if (!symbol) {
			return new Response('missing symbol', { status: 400 });
		}

		// create response header
		const responseHeader = {
			status: 200,
			headers: {
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'content-type': 'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
			},
		} satisfies ResponseInit;

		if (date) {
			const key = `${symbol}-${date}`;
			const cacheData = await env.get_historical_prices.get(key);

			// data in cache
			if (cacheData) {
				return new Response(cacheData, responseHeader);
			}

			// load data from api, save in cache
			const data = await getHistoricalPricesOnDate(symbol, date);

			// cache data for 1 minute
			await env.get_historical_prices.put(key, JSON.stringify(data), { expirationTtl: 60 });

			// return single object data
			return new Response(JSON.stringify(data), responseHeader);
		}

		if (period) {
			const key = `${symbol}-${period}`;
			const cacheData = await env.get_historical_prices.get(key);

			// data in cache
			if (cacheData) {
				return new Response(cacheData, responseHeader);
			}

			// load data from api, save into cache
			const loadingPeriod = resolveLoadingPeriod(period);
			const historicalPriceData = await getHistoricalPrices(symbol, loadingPeriod.loadingPeriod, loadingPeriod.from, loadingPeriod.to);
			const reveredData = historicalPriceData.reverse();
			await env.get_historical_prices.put(key, JSON.stringify(reveredData), { expirationTtl: 60 * 60 * 24 * 7 });

			// return array of data
			return new Response(JSON.stringify(reveredData), responseHeader);
		}

		// throw error if no period or date
		return new Response('missing period or date', { status: 400 });
	},
};

const getHistoricalPricesOnDate = async (symbol: string, date: string): Promise<HistoricalPrice> => {
	const url = `${FINANCIAL_MODELING_URL}/v3/historical-price-full/${symbol}?from=${date}&to=${date}&apikey=${FINANCIAL_MODELING_KEY}`;
	const response = await fetch(url);
	const data = (await response.json()) as { historical: HistoricalPrice[] };
	return data.historical[0];
};

const getHistoricalPrices = async (
	symbol: string,
	period: HistoricalLoadingPeriods,
	from: string,
	to: string,
): Promise<HistoricalPrice[]> => {
	const url = `${FINANCIAL_MODELING_URL}/v3/historical-chart/${period}/${symbol}?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
	const response = await fetch(url);
	const data = (await response.json()) as HistoricalPrice[];
	return data;
};

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

const resolveLoadingPeriod = (
	period: HistoricalPricePeriods,
): {
	loadingPeriod: HistoricalLoadingPeriods;
	from: string;
	to: string;
} => {
	const today = new Date();
	if (period === '1d') {
		return {
			loadingPeriod: '1min',
			from: formatDate(today),
			to: formatDate(today),
		};
	}

	if (period === '1w') {
		return {
			loadingPeriod: '5min',
			from: formatDate(subDays(today, 7)),
			to: formatDate(today),
		};
	}

	if (period === '1mo') {
		return {
			loadingPeriod: '1hour',
			from: formatDate(subDays(today, 30)),
			to: formatDate(today),
		};
	}

	if (period === '3mo') {
		return {
			loadingPeriod: '1hour',
			from: formatDate(subDays(today, 90)),
			to: formatDate(today),
		};
	}

	if (period === '6mo') {
		return {
			loadingPeriod: '4hour',
			from: formatDate(subDays(today, 180)),
			to: formatDate(today),
		};
	}

	if (period === '1y') {
		return {
			loadingPeriod: '1day',
			from: formatDate(subDays(today, 365)),
			to: formatDate(today),
		};
	}

	if (period === '5y') {
		return {
			loadingPeriod: '1week',
			from: formatDate(subDays(today, 365 * 5)),
			to: formatDate(today),
		};
	}

	if (period === 'all') {
		return {
			loadingPeriod: '1month',
			from: formatDate(subDays(today, 365 * 20)),
			to: formatDate(today),
		};
	}

	// ytd as default
	return {
		loadingPeriod: '1day',
		from: formatDate(new Date(today.getFullYear(), 0, 1)),
		to: formatDate(today),
	};
};
