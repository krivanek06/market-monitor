import { getQuotesByType } from '@market-monitor/api-external';
import { AvailableQuotes, EXPIRATION_ONE_WEEK, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

export const getQuotesByTypeWrapper = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	const quoteType = searchParams.get('quoteType') as AvailableQuotes | undefined;

	if (!quoteType) {
		return new Response('missing quote type', { status: 400 });
	}

	// load data from KV
	const key = `quote_${quoteType}`;
	const cachedData = await env.get_basic_data.get(key);
	if (cachedData) {
		return new Response(cachedData, RESPONSE_HEADER);
	}

	// load data
	const data = await getQuotesByType(quoteType);

	// save into cache for 1 week
	env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: EXPIRATION_ONE_WEEK });

	// stringify data and return
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};
