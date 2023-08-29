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

// helper types
const newsAcceptableTypes = ['general', 'stocks', 'forex', 'crypto'] as const;
type FirebaseNewsTypes = (typeof newsAcceptableTypes)[number];

const FINANCIAL_MODELING_KEY = '645c1db245d983df8a2d31bc39b92c32';
const FINANCIAL_MODELING_URL = 'https://financialmodelingprep.com/api';

export type News = {
	symbol: string;
	publishedDate: string;
	title: string;
	image: string;
	site: string;
	text: string;
	url: string;
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method !== 'GET') {
			return new Response('Method not allowed', { status: 405 });
		}

		const { searchParams } = new URL(request.url);

		// get query strings
		const newsType = searchParams.get('news_types') as FirebaseNewsTypes;
		const symbol = searchParams.get('symbol') ?? '';

		// create response header
		const responseHeader = {
			status: 200,
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		} satisfies ResponseInit;

		// if not news type, return empty array
		if (!newsType || !newsAcceptableTypes.includes(newsType)) {
			return new Response(JSON.stringify([]), responseHeader);
		}

		// create cache key
		const key = `${newsType}_${symbol}`;
		const cacheData = await env.getnews.get(key);

		// check if data exists
		if (!cacheData) {
			// get news from API
			const news = await getNewsFromApi(newsType, symbol);
			// save data into cache for 2h
			await env.getnews.put(key, JSON.stringify(news), { expirationTtl: 60 * 60 * 2 });
			// return data
			return new Response(JSON.stringify(news), responseHeader);
		}

		// return data
		return new Response(cacheData, responseHeader);
	},
};

const getNewsFromApi = async (newsType: FirebaseNewsTypes, symbol: string = '') => {
	const url = resolveNewsUrl(newsType, symbol);
	const response = await fetch(url);
	const data = await response.json();
	return data as News[];
};

const resolveNewsUrl = (newsType: FirebaseNewsTypes, symbol: string) => {
	const ticker = symbol ? `tickers=${symbol}&` : '';
	if (newsType === 'forex') {
		return `${FINANCIAL_MODELING_URL}/v4/forex_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
	}
	if (newsType === 'crypto') {
		return `${FINANCIAL_MODELING_URL}/v4/crypto_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
	}
	if (newsType === 'stocks') {
		return `${FINANCIAL_MODELING_URL}/v3/stock_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
	}
	// general
	return `${FINANCIAL_MODELING_URL}/v4/general_news?limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
};
