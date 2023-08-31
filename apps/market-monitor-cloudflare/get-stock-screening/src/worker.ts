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

// create response header
const responseHeader = {
	status: 200,
	headers: {
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'content-type': 'application/json;charset=UTF-8',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': '*',
	},
} satisfies ResponseInit;

type StockScreenerArray = [number | null, number | null] | null;
type StockScreenerValues = {
	country: string | null;
	industry: string | null;
	sector: string | null;
	exchange: string | null;
	marketCap: StockScreenerArray;
	price: StockScreenerArray;
	volume: StockScreenerArray;
	dividends: StockScreenerArray;
};

interface StockScreenerResults {
	symbol: string;
	companyName: string;
	marketCap: number;
	sector: string;
	industry: string;
	beta: number;
	price: number;
	lastAnnualDividend: number;
	volume: number;
	exchange: string;
	exchangeShortName: string;
	country: string;
	isEtf: boolean;
	isActivelyTrading: boolean;
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
			return new Response(JSON.stringify(stockScreeningResults), responseHeader);
		} catch (e) {
			console.log(e);
			return new Response('Error', { status: 500 });
		}
	},
};

const getStockScreening = async (values: StockScreenerValues): Promise<StockScreenerResults[]> => {
	const searchParams = getStockScreeningSearchParams(values);
	const searchParamsValues = String(searchParams).length > 0 ? `${searchParams}&` : '';

	const url = `${FINANCIAL_MODELING_URL}/v3/stock-screener?${searchParamsValues}limit=300&apikey=${FINANCIAL_MODELING_KEY}`;
	const response = await fetch(url);
	const data = (await response.json()) as StockScreenerResults[];

	// check if symbol contains any of the ignored symbols
	const filteredResponse = filterOutSymbols(data, ['sector']);
	return filteredResponse;
};

const filterOutSymbols = <T extends { symbol: string }>(
	data: T[],
	nonNullableKeys: (keyof T)[] = [],
	removeKeys: (keyof T)[] = [],
): T[] => {
	// if symbol con any of the ignored symbols, filter them out
	const ignoredSymbols = ['.', '-', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
	return (
		data
			// filter out symbols that contain any of the ignored symbols
			.filter((d) => !ignoredSymbols.some((ignoredSymbol) => d.symbol.includes(ignoredSymbol)))
			// filter out symbols if multiple one in the array
			// .filter((d, index) => data.indexOf(d) === index)
			// filter out symbols if keys are null
			.filter((d) => nonNullableKeys.every((key) => !!d[key]))
			.map((d) => {
				removeKeys.forEach((key) => delete d[key]);
				return d;
			})
	);
};

/**
 *
 * @param values
 * @returns an URLSearchParams from the provided StockScreenerValues object. Ignores keys that are
 * not part of the object
 */
const getStockScreeningSearchParams = (values: StockScreenerValues): URLSearchParams => {
	const searchParams = new URLSearchParams({});
	if (values.country) {
		searchParams.append('country', values.country);
	}
	if (values.sector) {
		searchParams.append('sector', values.sector);
	}
	if (values.industry) {
		searchParams.append('industry', values.industry);
	}
	if (values.exchange) {
		searchParams.append('exchange', values.exchange);
	}
	if (values.marketCap) {
		const [marketCapMoreThan, marketCapLowerThan] = values.marketCap;
		if (marketCapMoreThan) {
			searchParams.append('marketCapMoreThan', String(marketCapMoreThan));
		}
		if (marketCapLowerThan) {
			searchParams.append('marketCapLowerThan', String(marketCapLowerThan));
		}
	}

	if (values.price) {
		const [priceMoreThan, priceLowerThan] = values.price;
		if (priceMoreThan) {
			searchParams.append('priceMoreThan', String(priceMoreThan));
		}
		if (priceLowerThan) {
			searchParams.append('priceLowerThan', String(priceLowerThan));
		}
	}

	if (values.volume) {
		const [volumeMoreThan, volumeLowerThan] = values.volume;
		if (volumeMoreThan) {
			searchParams.append('volumeMoreThan', String(volumeMoreThan));
		}
		if (volumeLowerThan) {
			searchParams.append('volumeLowerThan', String(volumeLowerThan));
		}
	}

	if (values.dividends) {
		const [dividendMoreThan, dividendLowerThan] = values.dividends;
		if (dividendMoreThan) {
			searchParams.append('dividendMoreThan', String(dividendMoreThan));
		}
		if (dividendLowerThan) {
			searchParams.append('dividendLowerThan', String(dividendLowerThan));
		}
	}

	return searchParams;
};
