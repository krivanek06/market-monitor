import { getCompanyQuote, getProfile, getSymbolsPriceChanges, searchTicker } from '@mm/api-external';
import { CompanyProfile, PriceChange, RESPONSE_HEADER, SymbolQuote } from '@mm/api-types';
import { chunk, getCurrentDateDetailsFormat } from '@mm/shared/general-util';
import { isAfter, isToday, subMinutes } from 'date-fns';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { inArray, sql } from 'drizzle-orm';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

const SymbolSummaryTable = sqliteTable('symbol-summary', {
	id: text('id').primaryKey(),
	quote: text('quote', { mode: 'json' }).notNull().$type<SymbolQuote>(),
	profile: text('profile', { mode: 'json' }).$type<CompanyProfile | null>(),
	priceChange: text('priceChange', { mode: 'json' }).$type<PriceChange | null>(),
	lastUpdate: text('lastUpdate')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

type StockSummaryTable = typeof SymbolSummaryTable.$inferSelect;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { symbol, isSearch, isOnlyQuote, isCrypto, isAfterHours } = getParams(request.url);

		// throw error if no symbols
		if (!symbol) {
			return new Response('Symbol is required', { status: 400 });
		}

		// unique symbols adn not undefined
		let symbolArray = symbol
			.split(',')
			.filter((value, index, self) => self.indexOf(value) === index)
			.filter((d) => !!d);

		// if searching for symbols, get symbols from API
		if (isSearch) {
			// load searched symbols from API
			const searchResults = await searchTicker(symbolArray.at(0), isCrypto);
			// rewrite symbolArray with searched symbols
			symbolArray = searchResults.map((d) => d.symbol);
		}

		// no symbol
		if (symbolArray.length === 0) {
			return new Response(JSON.stringify([]), RESPONSE_HEADER);
		}

		// check if data exists in db
		const db = drizzle(env.DB);

		// data from DB
		const { validStoredData, reloadIds: symbolsToUpdate } = await getSummariesFromDB(symbolArray, isOnlyQuote, db, isAfterHours);

		// load summaries
		const summaries = !isOnlyQuote ? await loadSummaries(symbolsToUpdate) : await loadQuotes(symbolsToUpdate);

		// logs
		console.log('Request:', symbolArray.length, symbolArray);
		console.log(
			'Valid Saved',
			validStoredData.length,
			validStoredData.map((d) => d.id),
		);
		console.log('Reloaded', symbolsToUpdate.length, symbolsToUpdate);

		// save new summaries into cache for 3min
		await saveSummariesIntoDB(summaries, db);

		// order data by id asc
		const orderedSummaries = [...validStoredData, ...summaries].sort((a, b) => (a.id < b.id ? 1 : -1));
		const modifiedSummaries = orderedSummaries.map((d) => ({
			...d,
			quote: {
				...d.quote,
				// remove USD from symbol
				displaySymbol: d.quote.symbol.replace(d.quote.exchange === 'CRYPTO' ? 'USD' : '', ''),
			},
		}));

		// check if to return only quote or all data
		const result = isOnlyQuote ? modifiedSummaries.map((d) => d.quote) : modifiedSummaries;

		// return data
		return new Response(JSON.stringify(result), RESPONSE_HEADER);
	},
};

const saveSummariesIntoDB = async (data: StockSummaryTable[], db: DrizzleD1Database<Record<string, never>>): Promise<void> => {
	if (data.length === 0) {
		return;
	}

	try {
		const savedData = await db
			.insert(SymbolSummaryTable)
			.values(data)
			.onConflictDoUpdate({
				set: {
					quote: sql`excluded.quote`,
					priceChange: sql`excluded.priceChange`,
					profile: sql`excluded.profile`,
					lastUpdate: sql`CURRENT_TIMESTAMP`,
				},
				target: SymbolSummaryTable.id,
			})
			.returning()
			.all();

		const savedIds = savedData.map((d) => d.id);
		console.log('Summary: saved ids', savedIds);
	} catch (e) {
		console.log('error', e);
		console.log(
			'Unable to save',
			data.map((d) => d.id),
		);
	}
};

const loadQuotes = async (symbolsToUpdate: string[]): Promise<StockSummaryTable[]> => {
	const symbolChunks = chunk(symbolsToUpdate, 30);
	const loadedQuotes = (await Promise.all(symbolChunks.map((symbols) => getCompanyQuote(symbols)))).reduce(
		(acc, curr) => [...acc, ...curr],
		[],
	);

	return loadedQuotes.map((quote) => ({
		id: quote.symbol,
		lastUpdate: getCurrentDateDetailsFormat(),
		quote,
		priceChange: null,
		profile: null,
	}));
};

const getSummariesFromDB = async (
	symbols: string[],
	onlyQuotes: boolean,
	db: DrizzleD1Database<Record<string, never>>,
	isAfterHours: boolean = false,
) => {
	let storedSymbolSummaries: StockSummaryTable[] = [];
	try {
		// load data from db
		storedSymbolSummaries = await db.select().from(SymbolSummaryTable).where(inArray(SymbolSummaryTable.id, symbols)).all();
	} catch (e) {
		console.log('error', e);
		storedSymbolSummaries = [];
	}

	// check symbol validity 3min and some additional data must be present or if after hours active then only check date if today
	const validStoredData = storedSymbolSummaries.filter(
		(d) => (isAfterHours || checkDataValidityMinutes(d, 3)) && isToday(d.lastUpdate) && (onlyQuotes || !!d.priceChange),
	);
	const validStoredDataIds = validStoredData.map((d) => d.id);

	const reloadIds = symbols.filter((d) => !validStoredDataIds.includes(d));

	// symbols to update
	return { validStoredData, reloadIds };
};

const loadSummaries = async (symbolsToUpdate: string[]): Promise<StockSummaryTable[]> => {
	// load data from api with
	const [updatedQuotes, stockPriceChanges, profiles] =
		symbolsToUpdate.length > 0
			? await Promise.all([getCompanyQuote(symbolsToUpdate), getSymbolsPriceChanges(symbolsToUpdate), getProfile(symbolsToUpdate)])
			: [[], [], []];

	// map to correct data structure
	const summaries = symbolsToUpdate
		.map((symbol) => {
			// find data from loaded API
			const quote = updatedQuotes.find((q) => q.symbol === symbol);
			const priceChange = stockPriceChanges.find((p) => p.symbol === symbol);
			const profile = profiles.find((p) => p.symbol === symbol);

			// if any of the data is missing, return undefined
			if (!quote || !priceChange || quote.marketCap === 0) {
				return undefined;
			}

			// STRINGIFY DATA OTHERWISE NOT SAVED
			return {
				id: symbol,
				quote,
				priceChange: priceChange,
				profile: profile ?? null,
				lastUpdate: getCurrentDateDetailsFormat(),
			} satisfies StockSummaryTable;
		}) // filter out undefined values
		.filter((d) => !!d) as StockSummaryTable[];

	return summaries;
};

const getParams = (requestUrl: string) => {
	const { searchParams } = new URL(requestUrl);
	const symbolsString = searchParams.get('symbol') as string | undefined;

	// set isSearch to true if searching for symbols with same prefix
	const isSearch = searchParams.get('isSearch') === 'true';

	// stock, crypto, etf, fund
	const isCrypto = searchParams.get('isCrypto') === 'true';

	// check if to get only quote
	const isOnlyQuote = searchParams.get('onlyQuote') === 'true';

	// check if user request only after hours data
	const isAfterHours = searchParams.get('isAfterHours') === 'true';

	return { symbol: symbolsString, isSearch, isOnlyQuote, isCrypto, isAfterHours };
};

const checkDataValidityMinutes = <T extends { lastUpdate: string | Date }>(data: T | undefined, minutes: number) =>
	!!data && isAfter(new Date(data.lastUpdate), subMinutes(new Date(), minutes));
