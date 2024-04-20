import { getIsMarketOpen } from '@mm/api-external';
import { EXPIRATION_ONE_DAY, RESPONSE_HEADER } from '@mm/api-types';
import { Env } from './model';

export const getIsMarketOpenWrapper = async (env: Env): Promise<Response> => {
	// load data from KV
	const key = 'is_market_open';
	const cachedData = await env.get_basic_data.get(key);
	if (cachedData) {
		return new Response(cachedData, RESPONSE_HEADER);
	}

	// load from api
	const data = await getIsMarketOpen();

	// save into cache
	env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: EXPIRATION_ONE_DAY });

	// return stringified data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};
