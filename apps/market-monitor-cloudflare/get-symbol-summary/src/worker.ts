import { getCompanyQuote, getProfile, getSymbolsPriceChanges, searchTicker } from '@market-monitor/api-external';
import { RESPONSE_HEADER } from '@market-monitor/api-types';
import { checkDataValidityMinutes } from '@market-monitor/shared/utils-general';

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
import { drizzle } from 'drizzle-orm/d1';
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

const SymbolSummaryTable = sqliteTable('symbol_summary', {
	id: text('id').primaryKey(),
	quote: text('quote').notNull().$type<string>(),
	profile: text('profile').$type<string>(),
	priceChange: text('priceChange').notNull().$type<string>(),
	lastUpdate: text('lastUpdate')
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

		// unique symbols adn not undefined
		let symbolArray = symbolsString
			.split(',')
			.filter((value, index, self) => self.indexOf(value) === index)
			.filter((d) => !!d);

		// if searching for symbols, get symbols from API
		if (isSearch) {
			// load searched symbols from API
			const searchResults = await searchTicker(symbolArray[0], isSymbolTypeCrypto);
			// rewrite symbolArray with searched symbols
			symbolArray = searchResults.map((d) => d.symbol);
		}

		// no symbol
		if (symbolArray.length === 0) {
			return new Response(JSON.stringify([]), RESPONSE_HEADER);
		}

		// check if data exists in db
		const db = drizzle(env.DB);
		let storedSymbolSummaries: StockSummaryTable[] = [];
		let validStoredIds: string[] = [];
		try {
			// load data from db
			storedSymbolSummaries = (await db.select().from(SymbolSummaryTable).where(inArray(SymbolSummaryTable.id, symbolArray)).all()).map(
				formatSummaryToObject,
			);

			// check symbol validity 3min
			validStoredIds = storedSymbolSummaries.filter((d) => checkDataValidityMinutes(d, 3)).map((d) => d.id);
		} catch (e) {
			console.log('error', e);
		}

		// symbols to update
		const symbolsToUpdate = symbolArray.filter((symbol) => !validStoredIds.includes(symbol));

		// load data from api with
		const [updatedQuotes, stockPriceChanges, profiles] =
			symbolsToUpdate.length > 0
				? await Promise.all([getCompanyQuote(symbolsToUpdate), getSymbolsPriceChanges(symbolsToUpdate), getProfile(symbolsToUpdate)])
				: [[], [], []];

		console.log('validStoredIds', validStoredIds);
		console.log('symbolsToUpdate', symbolsToUpdate);

		// map to correct data structure
		const summaries = symbolsToUpdate
			.map((symbol) => {
				// find data from loaded API - ensureFind throws error if not found
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
					quote: JSON.stringify(quote),
					priceChange: JSON.stringify(priceChange),
					profile: profile ? JSON.stringify(profile) : null,
				};
			}) // filter out undefined values
			.filter((d): d is StockSummaryTable => !!d) satisfies StockSummaryTable[];

		// save new summaries into cache for 3min
		const savedData =
			summaries.length > 0
				? (
						await db
							.insert(SymbolSummaryTable)
							.values(summaries)
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
							.all()
				  ).map(formatSummaryToObject)
				: [];

		const savedIds = savedData.map((d) => d.id);
		console.log('saved ids', savedIds);

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
		return new Response(JSON.stringify(orderedSummaries), RESPONSE_HEADER);
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
