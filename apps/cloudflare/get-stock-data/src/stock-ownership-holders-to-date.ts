import { getSymbolOwnershipHolders } from '@market-monitor/api-external';
import { EXPIRATION_ONE_WEEK, RESPONSE_HEADER } from '@market-monitor/api-types';
import { isDateValidQuarter } from '@market-monitor/shared/utils-general';
import { Env } from './model';

export const getStockOwnershipHoldersToDataWrapper = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	const dateQuarter = searchParams.get('date') as string | undefined;

	// check if date is valid quarter
	if (!dateQuarter || !isDateValidQuarter(dateQuarter)) {
		return new Response('invalid date quarter', { status: 400 });
	}

	// create cache key
	const key = `${symbol}_ownership_holders_${dateQuarter}`;

	// check data in cache
	const cachedData = await env.get_stock_data.get(key);
	if (cachedData) {
		console.log(`Stock ownership holders to date for ${symbol} loaded from cache`);
		return new Response(cachedData, RESPONSE_HEADER);
	}

	console.log(`Stock ownership holders to date for ${symbol} loaded from API`);

	// reload data
	const [page0, page1, page2] = await Promise.all([
		getSymbolOwnershipHolders(symbol, dateQuarter, 0),
		getSymbolOwnershipHolders(symbol, dateQuarter, 1),
		getSymbolOwnershipHolders(symbol, dateQuarter, 2),
	]);
	const data = [...page0, ...page1, ...page2];

	// save data to cache
	env.get_stock_data.put(key, JSON.stringify(data), { expirationTtl: EXPIRATION_ONE_WEEK });

	// return data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};
