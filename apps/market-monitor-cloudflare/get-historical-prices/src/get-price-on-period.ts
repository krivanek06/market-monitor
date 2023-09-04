import { HistoricalPricePeriods, getHistoricalPricesByPeriod } from '@market-monitor/api-external';
import { HistoricalPrice, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

/**
 * save all periods into KV except for today
 * if today is monday and period is '1d', load data from friday
 *
 *
 * @param env
 * @param symbol
 * @param period
 * @returns
 */
export const getPriceOnPeriod = async (env: Env, symbol: string, period: HistoricalPricePeriods): Promise<Response> => {
	// create key
	const savedKey = `${symbol}-${period}`;

	// check data in cache
	const cachedData = (await env.historical_prices.get(savedKey, {
		type: 'json',
	})) as HistoricalPrice[] | null;

	// return data from cache if exists
	if (cachedData) {
		console.log(`Price on period key = ${savedKey} loaded from cache`);
		const reversedData = cachedData.reverse();
		return new Response(JSON.stringify(reversedData), RESPONSE_HEADER);
	}

	console.log(`Price on period key = ${savedKey} loaded from API`);

	// 12 hours
	const expiration12Hours = 12 * 60 * 60;

	// load data
	const data = await getHistoricalPricesByPeriod(symbol, period);

	// save to cache if not 1d
	if (period !== '1d') {
		console.log(`Price on period key = ${savedKey} saved to cache`);
		env.historical_prices.put(savedKey, JSON.stringify(data.data), { expirationTtl: expiration12Hours });
	}

	// return data
	const result = data.data.reverse();
	return new Response(JSON.stringify(result), RESPONSE_HEADER);
};
