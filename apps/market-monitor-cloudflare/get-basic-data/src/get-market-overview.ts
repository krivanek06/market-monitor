import { getMarketOverviewDataAPI } from '@market-monitor/api-external';
import { MarketOverview, MarketOverviewDatabaseKeys, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

export const getMarketOverData = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	// i.e: sp500
	const key = searchParams.get('key') as MarketOverviewDatabaseKeys;
	// i.e: peRatio
	const subKey = searchParams.get('subKey') as string;
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
		const expirationOneWeek = 60 * 60 * 24 * 7;
		await env.get_basic_data.put(cacheKey, JSON.stringify(data), { expirationTtl: expirationOneWeek });

		// return data
		return new Response(JSON.stringify(data), RESPONSE_HEADER);
	} catch (e) {
		return new Response(`Unable to Provide data for key=${key}, subkey=${subKey}`, { status: 400 });
	}
};

export const getMarketOverview = async (env: Env): Promise<Response> => {
	// check data in cache
	const cachedData = await env.get_basic_data.get('market-overview');
	if (cachedData) {
		return new Response(cachedData, RESPONSE_HEADER);
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

	const expirationOneWeek = 60 * 60 * 24 * 7;
	const key = 'market-overview';
	await env.get_basic_data.put(key, JSON.stringify(requestJson), { expirationTtl: expirationOneWeek });

	return new Response('saved', RESPONSE_HEADER);
};
