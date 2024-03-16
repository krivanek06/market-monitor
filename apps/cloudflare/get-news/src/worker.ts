/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { getNewsFromApi } from '@mm/api-external';
import { NewsAcceptableTypes, NewsTypes, RESPONSE_HEADER } from '@mm/api-types';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	getnews: KVNamespace;
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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);

		// get query strings
		const newsType = searchParams.get('news_types') as NewsTypes | undefined;
		const symbol = searchParams.get('symbol') ?? '';

		// if not news type, return empty array
		if (!newsType || !NewsAcceptableTypes.includes(newsType)) {
			return new Response(JSON.stringify([]), RESPONSE_HEADER);
		}

		// create cache key
		const key = `${newsType}_${symbol}`;
		const cacheData = await env.getnews.get(key);

		// check if data exists
		if (!cacheData) {
			// get news from API
			const news = await getNewsFromApi(newsType, symbol);
			// save data into cache for 2h
			const twoHours = 60 * 60 * 2;
			await env.getnews.put(key, JSON.stringify(news), { expirationTtl: twoHours });
			// return data
			return new Response(JSON.stringify(news), RESPONSE_HEADER);
		}

		// return data
		return new Response(cacheData, RESPONSE_HEADER);
	},
};
