import { getMarketOverviewDataAPI } from '@market-monitor/api-external';
import { MarketOverviewDatabaseKeys, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

export const getMarketOverData = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	// i.e: sp500
	const key = searchParams.get('key') as MarketOverviewDatabaseKeys;
	// i.e: peRatio
	const subKey = searchParams.get('subKey') as string;

	// missing keys
	if (!key || !subKey) {
		return new Response('missing key or subkey to access data', { status: 400 });
	}

	// check data in cache
	const cachedData = await env.get_basic_data.get(key);
	if (cachedData) {
		return new Response(cachedData, RESPONSE_HEADER);
	}

	// load data from api
	const data = await getMarketOverviewDataAPI(key, subKey);

	// save into cache
	const expirationOneWeek = 60 * 60 * 24 * 7;
	await env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: expirationOneWeek });

	// return data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};
