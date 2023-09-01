import { getInstitutionalPortfolioDates } from '@market-monitor/api-external';
import { RESPONSE_HEADER } from '@market-monitor/api-types';
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
	const expirationOneWeek = 60 * 60 * 24 * 7;
	env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: expirationOneWeek });

	// return stringified data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};
