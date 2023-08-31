import { HistoricalPricePeriods, getHistoricalPricesByPeriod, getHistoricalPricesOnDate } from '@market-monitor/api-external';
import { RESPONSE_HEADER } from '@market-monitor/api-types';
import { checkDataValidityMinutes } from '@market-monitor/shared-utils-general';
import { eq, sql } from 'drizzle-orm';
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

const HistoricalPricesTable = sqliteTable('historical_prices', {
	id: text('id').primaryKey(),
	data: text('data').notNull().$type<string>(),
	lastUpdate: text('lastUpdate')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

/**
 * return either historical data in array for a symbol if `period` is provided
 * of historical data in object for a symbol for a specific date if `date` is provided
 */
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

		// init db
		const db = drizzle(env.DB);

		// create key
		const savedKey = period ? `${symbol}-${period}` : `${symbol}-${date}`;

		// load from DB saved historical prices
		const storedHistoricalData = await db.select().from(HistoricalPricesTable).where(eq(HistoricalPricesTable.id, savedKey)).get();

		// data in cache
		if (storedHistoricalData && checkDataValidityMinutes(storedHistoricalData, 3)) {
			// data already in stringyfied format
			return new Response(storedHistoricalData.data, RESPONSE_HEADER);
		}

		// load data from api, save in cache
		const data = period ? await getHistoricalPricesByPeriod(symbol, period) : date ? await getHistoricalPricesOnDate(symbol, date) : null;

		// should not happen, just in case
		if (!data) {
			return new Response('missing period or date', { status: 400 });
		}

		// save into DB
		await db
			.insert(HistoricalPricesTable)
			.values({
				id: savedKey,
				data: JSON.stringify(data),
			})
			.onConflictDoUpdate({
				set: {
					data: JSON.stringify(data),
					lastUpdate: sql`CURRENT_TIMESTAMP`,
				},
				target: HistoricalPricesTable.id,
			})
			.run();

		// return single object data
		return new Response(JSON.stringify(data), RESPONSE_HEADER);
	},
};
