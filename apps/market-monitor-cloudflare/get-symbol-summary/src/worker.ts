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
	get_symbol_summary: KVNamespace;
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

type StockSummary = {
	id: string;
	quote: SymbolQuote;
	priceChange: PriceChange;
	profile: CompanyProfile | undefined;
};

type PriceChange = {
	symbol: string;
	'1D': number | null;
	'5D': number | null;
	'1M': number | null;
	'3M': number | null;
	'6M': number | null;
	ytd: number | null;
	'1Y': number | null;
	'3Y': number | null;
	'5Y': number | null;
	'10Y': number | null;
	max: number;
};

type TickerSearch = {
	symbol: string;
	name: string;
	currency: string;
	stockExchange: string;
	exchangeShortName: string;
};

type SymbolQuote = {
	symbol: string;
	name: string;
	price: number;
	// other data
};

type CompanyProfile = {
	symbol: string;
	price: number;
	// .... other data
};

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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);
		const symbolsString = searchParams.get('symbol') as string | undefined;

		// set isSearch to true if searching for symbols with same prefix
		const isSearchString = searchParams.get('isSearch') as string | undefined;
		const isSearch = isSearchString === 'true';

		// stock, crypto, etf, fund
		const symbolType = searchParams.get('symbolType') as string | undefined;
		const isSymbolTypeCrypto = symbolType === 'crypto';

		if (!symbolsString) {
			return new Response('Symbol is required', { status: 400 });
		}

		// unique symbols
		let symbolArray = symbolsString.split(',').filter((value, index, self) => self.indexOf(value) === index);

		// no symbol
		if (symbolArray.length === 0) {
			return new Response(JSON.stringify([]), responseHeader);
		}

		// if searching for symbols, get symbols from API
		if (isSearch) {
			// load searched symbols from API
			const searchResults = await searchTicker(symbolArray[0], isSymbolTypeCrypto);
			// rewrite symbolArray with searched symbols
			symbolArray = searchResults.map((d) => d.symbol);
		}

		// check if data exists in cache
		const cachedSummaries = (await Promise.all(symbolArray.map((d) => env.get_symbol_summary.get(d))))
			.filter((d): d is string => !!d)
			.map((d) => JSON.parse(d) as StockSummary);

		const cachedIds = cachedSummaries.map((d) => d.id);
		console.log('cachedIds', cachedIds);

		// symbols to update
		const symbolsToUpdate = symbolArray.filter((symbol) => !cachedSummaries.map((d) => d.id).includes(symbol));
		console.log('symbolsToUpdate', symbolsToUpdate);

		// load data from api with
		const [updatedQuotes, stockPriceChanges, profiles] = await Promise.all([
			getCompanyQuote(symbolsToUpdate),
			getSymbolsPriceChanges(symbolArray),
			getProfile(symbolArray),
		]);

		// map to correct data structure
		const summaries = symbolsToUpdate
			.map((symbol) => {
				// find data from loaded API - ensureFind throws error if not found
				const quote = updatedQuotes.find((q) => q.symbol === symbol);
				const priceChange = stockPriceChanges.find((p) => p.symbol === symbol);
				const profile = profiles.find((p) => p.symbol === symbol);

				// if any of the data is missing, return undefined
				if (!quote || !priceChange) {
					return undefined;
				}

				return {
					id: symbol,
					quote,
					priceChange,
					profile,
				};
			}) // filter out undefined values
			.filter((d): d is StockSummary => !!d) satisfies StockSummary[];

		// save new summaries into cache for 3min
		await Promise.all(summaries.map((d) => env.get_symbol_summary.put(d.id, JSON.stringify(d), { expirationTtl: 60 * 3 })));

		// order [summaries, cachedSummaries] the same way as symbolArray
		const orderedSummaries = symbolArray
			.map((symbol) => {
				const summary = summaries.find((d) => d.id === symbol);
				if (summary) {
					return summary;
				}
				return cachedSummaries.find((d) => d.id === symbol);
			})
			.filter((d): d is StockSummary => !!d);

		// return data
		return new Response(JSON.stringify(orderedSummaries), responseHeader);
	},
};

const getCompanyQuote = async (symbols: string[]): Promise<SymbolQuote[]> => {
	const symbol = symbols.join(',');
	const url = `${FINANCIAL_MODELING_URL}/v3/quote/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
	const response = await fetch(url);
	const data = (await response.json()) as SymbolQuote[];
	return data;
};

const getSymbolsPriceChanges = async (symbols: string[]): Promise<PriceChange[]> => {
	const symbolString = symbols.join(',');
	const url = `${FINANCIAL_MODELING_URL}/v3/stock-price-change/${symbolString}?apikey=${FINANCIAL_MODELING_KEY}`;
	const response = await fetch(url);
	const data = (await response.json()) as PriceChange[];
	return data;
};

const searchTicker = async (symbolPrefix: string, isCrypto = false): Promise<TickerSearch[]> => {
	const stockExchange = 'NASDAQ,NYSE';
	const cryptoExchange = 'CRYPTO';
	const usedExchange = isCrypto ? cryptoExchange : stockExchange;
	const prefixUppercase = symbolPrefix.toUpperCase();
	const url = `${FINANCIAL_MODELING_URL}/v3/search?query=${prefixUppercase}&limit=12&exchange=${usedExchange}&apikey=${FINANCIAL_MODELING_KEY}`;

	const response = await fetch(url);
	const data = (await response.json()) as TickerSearch[];

	// check if symbol contains any of the ignored symbols
	const filteredResponse = filterOutSymbols(data);
	return filteredResponse;
};

const getProfile = async (symbols: string[]): Promise<CompanyProfile[]> => {
	const symbol = symbols.join(',');
	const url = `${FINANCIAL_MODELING_URL}/v3/profile/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
	const response = await fetch(url);
	const data = (await response.json()) as CompanyProfile[];
	return data;
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
