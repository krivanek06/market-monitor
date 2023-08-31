/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { isBefore, subMinutes } from 'date-fns';
import { inArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	DB: D1Database;
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

const SymbolSummaryTable = sqliteTable('symbol_summary', {
	id: text('id').primaryKey(),
	quote: text('quote').notNull().$type<string>(),
	profile: text('profile').$type<string>(),
	priceChange: text('priceChange').notNull().$type<string>(),
	lastUpdated: integer('lastUpdated', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

type StockSummaryTable = typeof SymbolSummaryTable.$inferSelect;

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

		// throw error if no symbols
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

		// check if data exists in db
		const db = drizzle(env.DB);
		const storedSymbolSummaries = (await db.select().from(SymbolSummaryTable).where(inArray(SymbolSummaryTable.id, symbolArray)).all()).map(
			formatSummaryToObject,
		);

		// check symbol validity 3min
		const validStoredIds = storedSymbolSummaries
			.filter((d) => !isBefore(new Date(d.lastUpdated), subMinutes(new Date(), 3)))
			.map((d) => d.id);

		// symbols to update
		const symbolsToUpdate = symbolArray.filter((symbol) => !validStoredIds.includes(symbol));

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

				// STRINGIFY DATA OTHERWISE NOT SAVED
				return {
					id: symbol,
					quote: JSON.stringify(quote),
					priceChange: JSON.stringify(priceChange),
					profile: profile ? JSON.stringify(profile) : null,
				};
			}) // filter out undefined values
			.filter((d): d is StockSummaryTable => !!d) satisfies StockSummaryTable[];

		// save new summaries into cache for 3min
		const savedData =
			summaries.length > 0 ? (await db.insert(SymbolSummaryTable).values(summaries).returning().all()).map(formatSummaryToObject) : [];

		// order [summaries, cachedSummaries] the same way as symbolArray
		const orderedSummaries = symbolArray
			.map((symbol) => {
				const summary = savedData.find((d) => d.id === symbol);
				if (summary) {
					return summary;
				}
				return storedSymbolSummaries.find((d) => d.id === symbol);
			})
			.filter((d): d is StockSummaryTable => !!d);

		// return data
		return new Response(JSON.stringify(orderedSummaries), responseHeader);
	},
};

const formatSummaryToObject = (summary: StockSummaryTable) => {
	return {
		...summary,
		quote: JSON.parse(summary.quote),
		profile: summary.profile ? JSON.parse(summary.profile) : null,
		priceChange: JSON.parse(summary.priceChange),
	};
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
