import { getMarketOverviewDataAPI } from '@market-monitor/api-external';
import {
	EXPIRATION_ONE_WEEK,
	MarketOverview,
	MarketOverviewKey,
	MarketOverviewSubkeyReadable,
	RESPONSE_HEADER,
} from '@market-monitor/api-types';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Env, MarketDataTable } from './model';

const MARKET_OVERVIEW_KEY = 'market_overview';

export const getMarketOverData = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	// i.e: sp500
	const key = searchParams.get('key') as MarketOverviewKey;
	// i.e: peRatio
	const subKey = searchParams.get('subKey') as MarketOverviewSubkeyReadable<MarketOverviewKey>;
	// create cache key
	const cacheKey = `${key}-${subKey}`;

	// missing keys
	if (!key || !subKey) {
		return new Response('missing key or subkey to access data', { status: 400 });
	}

	// check data in cache
	const cachedData = await env.get_basic_data.get(cacheKey);
	if (cachedData) {
		return new Response(cachedData, RESPONSE_HEADER);
	}

	// load data from api
	try {
		const data = await getMarketOverviewDataAPI(key, subKey);

		// save into cache
		await env.get_basic_data.put(cacheKey, JSON.stringify(data), { expirationTtl: EXPIRATION_ONE_WEEK });

		// return data
		return new Response(JSON.stringify(data), RESPONSE_HEADER);
	} catch (e) {
		return new Response(`Unable to Provide data for key=${key}, subkey=${subKey}`, { status: 400 });
	}
};

export const getMarketOverview = async (env: Env): Promise<Response> => {
	// init db
	const db = drizzle(env.DB);

	// load from DB saved historical prices
	const storedOverview = await db.select().from(MarketDataTable).where(eq(MarketDataTable.id, MARKET_OVERVIEW_KEY)).get();

	// data in cache
	if (storedOverview) {
		// data already in stringyfied format
		return new Response(storedOverview.data, RESPONSE_HEADER);
	}

	// return error if no data
	return new Response('No data available', { status: 400 });
};

export const saveMarketOverview = async (env: Env, request: Request): Promise<Response> => {
	let requestJson: MarketOverview;
	try {
		requestJson = (await request.json()) as MarketOverview;
	} catch (e) {
		requestJson = request as any as MarketOverview;
	}

	if (!requestJson) {
		return new Response('Missing request body', { status: 400 });
	}

	// init db
	const db = drizzle(env.DB);

	// save into DB
	await db
		.insert(MarketDataTable)
		.values({
			id: MARKET_OVERVIEW_KEY,
			data: JSON.stringify(requestJson),
		})
		.onConflictDoUpdate({
			set: {
				data: JSON.stringify(requestJson),
				lastUpdate: sql`CURRENT_TIMESTAMP`,
			},
			target: MarketDataTable.id,
		})
		.run();

	return new Response('saved', RESPONSE_HEADER);
};
