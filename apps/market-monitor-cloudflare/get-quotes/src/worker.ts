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

const FINANCIAL_MODELING_KEY = '645c1db245d983df8a2d31bc39b92c32';
const FINANCIAL_MODELING_URL = 'https://financialmodelingprep.com/api';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);
		const symbol = searchParams.get('symbol') as string | undefined;

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

		// ignore the same symbol
		const symbolArray = symbol.split(',').filter((value, index, self) => self.indexOf(value) === index);

		// return empty array if no symbol
		if (!symbol) {
			return new Response(JSON.stringify([]), responseHeader);
		}

		// load from API
		const data = await getQuotesBySymbols(symbolArray);

		// return data
		return new Response(JSON.stringify(data), responseHeader);
	},
};

const getQuotesBySymbols = async (symbols: string[]) => {
	const symbolsString = symbols.join(',');
	const url = `${FINANCIAL_MODELING_URL}/v3/quote/${symbolsString}?apikey=${FINANCIAL_MODELING_KEY}`;
	const response = await fetch(url);
	const data = await response.json();
	return data as any[];
};
