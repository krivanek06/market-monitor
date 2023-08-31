import { getStockScreening } from '@market-monitor/api-external';
import { RESPONSE_HEADER, StockScreenerValues } from '@market-monitor/api-types';
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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			let requestJson: StockScreenerValues;
			try {
				requestJson = (await request.json()) as StockScreenerValues;
			} catch (e) {
				requestJson = request as any as StockScreenerValues;
			}

			if (!requestJson) {
				return new Response('Missing request body', { status: 400 });
			}

			// get stock screening results
			const stockScreeningResults = await getStockScreening(requestJson);

			// return data
			return new Response(JSON.stringify(stockScreeningResults), RESPONSE_HEADER);
		} catch (e) {
			console.log(e);
			return new Response('Error', { status: 500 });
		}
	},
};
