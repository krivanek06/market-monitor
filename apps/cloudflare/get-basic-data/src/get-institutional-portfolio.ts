import { getInstitutionalPortfolioDates } from '@mm/api-external';
import { EXPIRATION_ONE_WEEK, RESPONSE_HEADER } from '@mm/api-types';
import { Env } from './model';

export const getInstitutionalPortfolioDatesWrapper = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	// load data from KV
	const key = 'institutional_portfolio_dates';
	const cachedData = await env.get_basic_data.get(key);
	if (cachedData) {
		return new Response(cachedData, RESPONSE_HEADER);
	}

	// load from api
	const data = await getInstitutionalPortfolioDates();

	// save into cache
	env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: EXPIRATION_ONE_WEEK });

	// return stringified data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};
