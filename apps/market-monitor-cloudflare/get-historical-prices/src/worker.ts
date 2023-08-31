import { HistoricalPricePeriods, getHistoricalPricesByPeriod, getHistoricalPricesOnDate } from '@market-monitor/api-external';
import { RESPONSE_HEADER } from '@market-monitor/api-types';
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

		if (date) {
			const key = `${symbol}-${date}`;
			const cacheData = await env.get_historical_prices.get(key);

			// data in cache
			if (cacheData) {
				return new Response(cacheData, RESPONSE_HEADER);
			}

			// load data from api, save in cache
			const data = await getHistoricalPricesOnDate(symbol, date);

			// cache data for 1 minute
			await env.get_historical_prices.put(key, JSON.stringify(data), { expirationTtl: 60 });

			// return single object data
			return new Response(JSON.stringify(data), RESPONSE_HEADER);
		}

		if (period) {
			const key = `${symbol}-${period}`;
			const cacheData = await env.get_historical_prices.get(key);

			// data in cache
			if (cacheData) {
				return new Response(cacheData, RESPONSE_HEADER);
			}

			// load data from api
			const historicalPriceData = await getHistoricalPricesByPeriod(symbol, period);

			// save into cache
			await env.get_historical_prices.put(key, JSON.stringify(historicalPriceData), { expirationTtl: 120 });

			// return array of data
			return new Response(JSON.stringify(historicalPriceData), RESPONSE_HEADER);
		}

		// throw error if no period or date
		return new Response('missing period or date', { status: 400 });
	},
};
