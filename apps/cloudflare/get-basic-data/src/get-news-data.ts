import { getNewsFromApi } from '@mm/api-external';
import { EXPIRATION_ONE_HOUR, NewsAcceptableTypes, NewsTypes, RESPONSE_HEADER } from '@mm/api-types';
import { Env } from './model';

export const getNewsData = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	const newsType = searchParams.get('news_types') as NewsTypes | undefined;
	const symbol = searchParams.get('symbol') ?? '';

	// if not news type, return empty array
	if (!newsType || !NewsAcceptableTypes.includes(newsType)) {
		return new Response(JSON.stringify([]), RESPONSE_HEADER);
	}

	// create cache key
	const key = `news_${newsType}_${symbol}`;
	const cacheData = await env.get_basic_data.get(key);

	// check if data exists
	if (!cacheData) {
		// get news from API
		const news = await getNewsFromApi(newsType, symbol);
		// save data into cache
		await env.get_basic_data.put(key, JSON.stringify(news), { expirationTtl: EXPIRATION_ONE_HOUR });
		// return data
		return new Response(JSON.stringify(news), RESPONSE_HEADER);
	}

	// return data
	return new Response(cacheData, RESPONSE_HEADER);
};
